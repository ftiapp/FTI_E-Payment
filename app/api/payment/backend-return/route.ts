import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ResultSetHeader } from 'mysql2'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    // Get payment response from 2C2P (JWT payload)
    const { payload } = await request.json()
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Missing payload' },
        { status: 400 }
      )
    }

    // Decode JWT response
    const secretCode = process.env.FTI_2C2P_SECRET_KEY
    if (!secretCode) {
      return NextResponse.json(
        { error: 'Missing secret code configuration' },
        { status: 500 }
      )
    }

    let paymentResponse: any
    try {
      paymentResponse = jwt.verify(payload, secretCode, { algorithms: ['HS256'] })
    } catch (error) {
      console.error('Failed to decode 2C2P response:', error)
      return NextResponse.json(
        { error: 'Invalid payload signature' },
        { status: 400 }
      )
    }
    
    console.log('2C2P Backend Payment Response:', paymentResponse)

    // Extract payment details
    const {
      merchantID,
      invoiceNo,
      accountNo,
      amount,
      currencyCode,
      tranRef,
      referenceNo,
      approvalCode,
      eci,
      transactionDateTime,
      respCode,
      respDesc
    } = paymentResponse

    // Validate merchant ID
    const expectedMerchantID = process.env.NEXT_PUBLIC_2C2P_MERCHANT_ID
    if (merchantID !== expectedMerchantID) {
      console.error('Invalid merchant ID:', merchantID)
      return NextResponse.json({ error: 'Invalid merchant' }, { status: 400 })
    }

    // Update payment status in database
    try {
      console.log(`🔄 Processing payment callback for invoice: ${invoiceNo}`)
      const connection = await pool.getConnection()
      
      try {
        await connection.beginTransaction()

        // Update transaction status using invoice_number (can have multiple records)
        const paymentStatus = respCode === '0000' ? 'completed' : 'failed'
        console.log(`📊 Updating payment status to: ${paymentStatus}`)
        
        // First check if any transaction exists with this invoice number
        // Use exact match only
        const [existingTransactions]: any = await connection.query(
          `SELECT id, payment_status FROM \`FTI_E-Payment_transactions\` WHERE invoice_number = ?`,
          [invoiceNo]
        )
        
        console.log(`📋 Found ${existingTransactions.length} transactions for invoice: "${invoiceNo}" (exact match)`)
        
        if (existingTransactions.length === 0) {
          console.error(`❌ No transaction found for invoice: ${invoiceNo}`)
          console.error('💡 This might indicate:')
          console.error('   - Transaction creation failed before payment')
          console.error('   - Invoice number format mismatch')
          console.error('   - Database connection issue')
          
          // Create a log entry for debugging
          await connection.query(
            `INSERT INTO \`FTI_E-Payment_audit_log\` 
             (transaction_id, action, old_values, new_values, user_id) 
             VALUES (?, ?, ?, ?, ?)`,
            [
              null,
              'callback_no_transaction',
              JSON.stringify({ invoiceNo, respCode, respDesc }),
              JSON.stringify({ paymentResponse }),
              '2C2P_CALLBACK'
            ]
          )
          
          await connection.rollback()
          connection.release()
          return NextResponse.json(
            { error: 'Transaction not found', invoiceNo, debug: 'No matching invoice in database' },
            { status: 404 }
          )
        }

        // Update ALL pending transactions for this invoice
        const [updateResult] = await connection.query<ResultSetHeader>(
          `UPDATE \`FTI_E-Payment_transactions\` 
           SET payment_status = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE invoice_number = ? AND payment_status = 'pending'`,
          [paymentStatus, invoiceNo]
        )

        if (updateResult.affectedRows === 0) {
          console.warn(`⚠️ No pending transactions to update for invoice: ${invoiceNo}`)
          console.warn('Existing transactions:', existingTransactions)
          
          // Check if all transactions are already processed
          const allProcessed = existingTransactions.every((t: any) => t.payment_status !== 'pending')
          if (allProcessed) {
            console.log(`ℹ️ All transactions for invoice ${invoiceNo} are already processed`)
          }
        }

        console.log(`✅ Transaction updated successfully for invoice: ${invoiceNo}`)

        // Get transaction ID for the most recently updated transaction
        const [rows]: any = await connection.query(
          `SELECT id FROM \`FTI_E-Payment_transactions\` 
           WHERE invoice_number = ? 
           ORDER BY updated_at DESC 
           LIMIT 1`,
          [invoiceNo]
        )
        
        if (rows.length === 0) {
          console.error(`❌ Could not retrieve transaction ID for invoice: ${invoiceNo}`)
          await connection.rollback()
          connection.release()
          return NextResponse.json(
            { error: 'Could not retrieve transaction ID' },
            { status: 500 }
          )
        }
        
        const transactionId = rows[0].id
        console.log(`📝 Retrieved transaction ID: ${transactionId} for invoice: ${invoiceNo}`)

        // Insert payment details
        console.log(`💾 Inserting payment details for transaction ID: ${transactionId}`)
        const [paymentDetailsResult] = await connection.query<ResultSetHeader>(
          `INSERT INTO \`FTI_E-Payment_payment_details\` 
           (transaction_id, payment_method, payment_reference, payment_date, 
            amount_paid, payment_status, gateway_response) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            transactionId,
            'credit_card', // or extract from payment channel
            tranRef,
            transactionDateTime || new Date(),
            amount,
            paymentStatus,
            JSON.stringify({
              respCode,
              respDesc,
              approvalCode,
              referenceNo,
              accountNo,
              eci,
              merchantID,
              currencyCode
            })
          ]
        )
        
        console.log(`✅ Payment details inserted: ID=${paymentDetailsResult.insertId}`)

        await connection.commit()
        console.log(`✅ Payment ${paymentStatus} for invoice ${invoiceNo}, Transaction ID: ${transactionId}`)
        
      } catch (dbError) {
        await connection.rollback()
        throw dbError
      } finally {
        connection.release()
      }

    } catch (dbError) {
      console.error('Database update error:', dbError)
      // Don't return error to 2C2P, just log it
    }

    // Log the payment result and send notifications
    if (respCode === '0000') {
      console.log(`✅ Payment successful for invoice ${invoiceNo}`)
      // TODO: Send email confirmation here
    } else {
      console.log(`❌ Payment failed for invoice ${invoiceNo}: ${respDesc}`)
      
      // Handle specific fraud/test card scenarios
      const fraudCodes = ['1001', '1002', '1003', '2001', '2002', '2003'] // Common fraud detection codes
      const testCardCodes = ['9999', '9998', '9997'] // Test card codes
      
      if (fraudCodes.includes(respCode)) {
        console.log(`🚨 FRAUD DETECTION - Invoice ${invoiceNo}, Code: ${respCode}`)
        // TODO: Send fraud alert notification to admin
        // TODO: Consider blacklisting the customer/IP
      } else if (testCardCodes.includes(respCode)) {
        console.log(`🧪 TEST CARD USED - Invoice ${invoiceNo}, Code: ${respCode}`)
        // TODO: Log test card usage for monitoring
      }
      
      // TODO: Send failure notification to customer
    }

    // Return success response to 2C2P
    return NextResponse.json({
      respCode: '0000',
      respDesc: 'Success'
    })

  } catch (error) {
    console.error('Backend return error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
