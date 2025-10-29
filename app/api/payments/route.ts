import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export async function POST(request: NextRequest) {
  try {
    const paymentData = await request.json()

    // Validate required fields
    const requiredFields = ['invoice_number', 'address', 'service_or_product', 'total_amount']
    for (const field of requiredFields) {
      if (!paymentData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Normalize and validate amount to number with 2 decimals
    const amountNum = Number.parseFloat(paymentData.total_amount)
    if (!Number.isFinite(amountNum) || amountNum < 0) {
      return NextResponse.json(
        { error: 'Invalid total_amount. It must be a positive number.' },
        { status: 400 }
      )
    }
    // Force 2-decimal precision for storage/consistency
    paymentData.total_amount = Number(amountNum.toFixed(2))

    console.log('Payment data to be inserted:', paymentData)

    // Database insertion
    let customerId: number | null = null
    let transactionId: number | null = null
    let transactionReference: string | null = null

    try {
      const connection = await pool.getConnection()
      
      try {
        await connection.beginTransaction()

        // Step 1: Insert customer data
        if (paymentData.customer_type === 'corporate') {
          // Insert corporate customer
          const [corporateResult] = await connection.query<ResultSetHeader>(
            `INSERT INTO \`FTI_E-Payment_corporate_customers\` 
             (company_name, tax_id, fti_member_id, phone, email, address) 
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
             company_name = VALUES(company_name),
             fti_member_id = VALUES(fti_member_id),
             phone = VALUES(phone),
             email = VALUES(email),
             address = VALUES(address),
             updated_at = CURRENT_TIMESTAMP`,
            [
              paymentData.company_name,
              paymentData.tax_id,
              paymentData.fti_member_id,
              paymentData.phone,
              paymentData.email,
              paymentData.address
            ]
          )
          customerId = corporateResult.insertId

          // If it was an update, get the existing ID
          if (customerId === 0 && paymentData.tax_id) {
            const [rows] = await connection.query<RowDataPacket[]>(
              'SELECT id FROM `FTI_E-Payment_corporate_customers` WHERE tax_id = ?',
              [paymentData.tax_id]
            )
            if (rows.length > 0) {
              customerId = rows[0].id
            }
          }
        } else {
          // Insert personal customer
          const [personalResult] = await connection.query<ResultSetHeader>(
            `INSERT INTO \`FTI_E-Payment_personal_customers\` 
             (first_name, last_name, tax_id, fti_member_id, phone, email, address) 
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
             first_name = VALUES(first_name),
             last_name = VALUES(last_name),
             fti_member_id = VALUES(fti_member_id),
             phone = VALUES(phone),
             email = VALUES(email),
             address = VALUES(address),
             updated_at = CURRENT_TIMESTAMP`,
            [
              paymentData.first_name,
              paymentData.last_name,
              paymentData.tax_id,
              paymentData.fti_member_id,
              paymentData.phone,
              paymentData.email,
              paymentData.address
            ]
          )
          customerId = personalResult.insertId

          // If it was an update, get the existing ID
          if (customerId === 0 && paymentData.tax_id) {
            const [rows] = await connection.query<RowDataPacket[]>(
              'SELECT id FROM `FTI_E-Payment_personal_customers` WHERE tax_id = ?',
              [paymentData.tax_id]
            )
            if (rows.length > 0) {
              customerId = rows[0].id
            }
          }
        }

        // Step 2: Insert transaction with unique transaction_reference
        transactionReference = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        const [transactionResult] = await connection.query<ResultSetHeader>(
          `INSERT INTO \`FTI_E-Payment_transactions\` 
           (transaction_reference, invoice_number, customer_type, corporate_customer_id, personal_customer_id, 
            others_reference, service_or_product, total_amount, payment_status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
          [
            transactionReference,
            paymentData.invoice_number,
            paymentData.customer_type,
            paymentData.customer_type === 'corporate' ? customerId : null,
            paymentData.customer_type === 'personal' ? customerId : null,
            paymentData.others_reference,
            paymentData.service_or_product,
            paymentData.total_amount
          ]
        )
        transactionId = transactionResult.insertId

        await connection.commit()
        console.log(`✅ Transaction created: ID=${transactionId}, Ref=${transactionReference}, Customer ID=${customerId}`)
        
      } catch (dbError) {
        await connection.rollback()
        throw dbError
      } finally {
        connection.release()
      }

    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save payment data to database', details: String(dbError) },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Payment data saved successfully',
        transactionId: transactionId,
        transactionReference: transactionReference,
        customerId: customerId,
        data: paymentData 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
