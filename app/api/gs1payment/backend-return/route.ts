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
    const secretCode = process.env.NEXT_PUBLIC_2C2P_SECRET_CODE
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
      console.error('Failed to decode GS1 2C2P response:', error)
      return NextResponse.json(
        { error: 'Invalid payload signature' },
        { status: 400 }
      )
    }
    
    console.log('GS1 2C2P Backend Payment Response:', paymentResponse)

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
      const connection = await pool.getConnection()
      
      try {
        await connection.beginTransaction()

        // Update transaction status
        const paymentStatus = respCode === '0000' ? 'completed' : 'failed'
        // First check if any GS1 transaction exists with this invoice number (using LIKE pattern)
        // 2C2P sends original invoice (e.g., "1234567891"), we store unique (e.g., "1234567891-1234567890")
        const [existingTransactions]: any = await connection.query(
          `SELECT id, payment_status FROM \`GS1_transactions\` WHERE invoice_number LIKE ?`,
          [`${invoiceNo}-%`]
        )
        
        console.log(`📋 Found ${existingTransactions.length} GS1 transactions for invoice pattern: ${invoiceNo}-%`)
        
        if (existingTransactions.length === 0) {
          console.error(`❌ No GS1 transaction found for invoice: ${invoiceNo}`)
          console.error('💡 This might indicate:')
          console.error('   - GS1 Transaction creation failed before payment')
          console.error('   - Invoice number format mismatch')
          console.error('   - Database connection issue')
          
          await connection.rollback()
          connection.release()
          return NextResponse.json(
            { error: 'GS1 Transaction not found', invoiceNo, debug: 'No matching invoice in database' },
            { status: 404 }
          )
        }

        // Update ALL pending GS1 transactions for this invoice pattern
        const [updateResult] = await connection.query<ResultSetHeader>(
          `UPDATE \`GS1_transactions\` 
           SET payment_status = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE invoice_number LIKE ? AND payment_status = 'pending'`,
          [paymentStatus, `${invoiceNo}-%`]
        )

        if (updateResult.affectedRows === 0) {
          console.warn(`⚠️ No pending GS1 transactions to update for invoice: ${invoiceNo}`)
          console.warn('Existing transactions:', existingTransactions)
          
          // Check if all transactions are already processed
          const allProcessed = existingTransactions.every((t: any) => t.payment_status !== 'pending')
          if (allProcessed) {
            console.log(`ℹ️ All GS1 transactions for invoice ${invoiceNo} are already processed`)
          }
        }

        // Get transaction ID
        const [rows]: any = await connection.query(
          `SELECT id FROM \`GS1_transactions\` 
           WHERE invoice_number LIKE ? 
           ORDER BY updated_at DESC 
           LIMIT 1`,
          [`${invoiceNo}-%`]
        )
        const transactionId = rows[0]?.id

        // Insert payment details
        await connection.query(
          `INSERT INTO \`GS1_payment_details\` 
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

        await connection.commit()
        console.log(`✅ GS1 Payment ${paymentStatus} for invoice ${invoiceNo}, Transaction ID: ${transactionId}`)
        
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
      console.log(`✅ GS1 Payment successful for invoice ${invoiceNo}`)
      // TODO: Send email confirmation here
    } else {
      console.log(`❌ GS1 Payment failed for invoice ${invoiceNo}: ${respDesc}`)
      // TODO: Send failure notification
    }

    // Return success response to 2C2P
    return NextResponse.json({
      respCode: '0000',
      respDesc: 'Success'
    })

  } catch (error) {
    console.error('GS1 Backend return error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
