import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function POST(request: NextRequest) {
  try {
    const { invoiceNo } = await request.json()

    if (!invoiceNo) {
      console.error('❌ Inquiry API: Missing invoice number')
      return NextResponse.json(
        { error: 'Invoice number is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Payment inquiry for invoice: "${invoiceNo}" (length: ${invoiceNo?.length})`)

    // Query payment status from database
    const connection = await pool.getConnection()
    
    try {
      // Get transaction details using exact match
      const [transactions] = await connection.query<RowDataPacket[]>(
        `SELECT t.*, pd.payment_reference as tranRef, pd.payment_date as transactionDateTime,
                pd.gateway_response, pd.amount_paid as amount
         FROM \`FTI_E-Payment_transactions\` t
         LEFT JOIN \`FTI_E-Payment_payment_details\` pd ON t.id = pd.transaction_id
         WHERE t.invoice_number = ?
         ORDER BY pd.created_at DESC
         LIMIT 1`,
        [invoiceNo]
      )

      console.log(`📋 Found ${transactions.length} transactions for inquiry: "${invoiceNo}" (exact match)`)
      if (transactions.length > 0) {
        console.log(`🔍 First transaction: ID=${transactions[0].id}, invoice="${transactions[0].invoice_number}", status=${transactions[0].payment_status}`)
      }

      if (transactions.length === 0) {
        console.error(`❌ No transaction found for inquiry: ${invoiceNo}`)
        
        // Check if transaction exists without payment details
        const [basicTransactions] = await connection.query<RowDataPacket[]>(
          `SELECT id, payment_status, created_at, updated_at
           FROM \`FTI_E-Payment_transactions\` 
           WHERE invoice_number = ?`,
          [invoiceNo]
        )
        
        console.log(`🔍 Basic transaction check for invoice ${invoiceNo}: ${basicTransactions.length} found`)
        
        return NextResponse.json(
          { 
            error: 'Transaction not found',
            details: 'No transaction found for this invoice number',
            invoiceNo,
            debug: {
              basicTransactionsFound: basicTransactions.length,
              basicTransactions: basicTransactions
            }
          },
          { status: 404 }
        )
      }

      const transaction = transactions[0]
      console.log(`✅ Transaction found: ID=${transaction.id}, Status=${transaction.payment_status}`)
      
      // Parse gateway response if exists
      let gatewayData: any = {}
      if (transaction.gateway_response) {
        try {
          gatewayData = JSON.parse(transaction.gateway_response)
          console.log(`📊 Gateway response parsed: ${Object.keys(gatewayData).join(', ')}`)
        } catch (e) {
          console.error('Failed to parse gateway response:', e)
        }
      } else {
        console.log('⚠️ No gateway response found')
      }

      // Format response similar to 2C2P format
      const inquiryResponse = {
        invoiceNo: transaction.invoice_number,
        amount: transaction.amount || transaction.total_amount,
        currencyCode: transaction.currency || 'THB',
        tranRef: transaction.tranRef || gatewayData.tranRef || '',
        referenceNo: gatewayData.referenceNo || '',
        approvalCode: gatewayData.approvalCode || '',
        transactionDateTime: transaction.transactionDateTime || transaction.updated_at,
        respCode: transaction.payment_status === 'completed' ? '0000' : 
                  transaction.payment_status === 'pending' ? '2001' : '2003',
        respDesc: transaction.payment_status === 'completed' ? 'Success' : 
                  transaction.payment_status === 'pending' ? 'Transaction in progress' : 'Payment Failed',
        paymentStatus: transaction.payment_status
      }

      console.log(`✅ Inquiry response prepared for ${invoiceNo}: ${inquiryResponse.respCode} - ${inquiryResponse.respDesc}`)

      return NextResponse.json({
        success: true,
        data: inquiryResponse
      })

    } finally {
      connection.release()
    }

  } catch (error) {
    console.error('❌ Payment inquiry error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
