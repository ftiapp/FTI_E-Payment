import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function POST(request: NextRequest) {
  try {
    const { invoiceNo } = await request.json()

    if (!invoiceNo) {
      return NextResponse.json(
        { error: 'Invoice number is required' },
        { status: 400 }
      )
    }

    // Query payment status from database
    const connection = await pool.getConnection()
    
    try {
      // Get transaction details
      const [transactions] = await connection.query<RowDataPacket[]>(
        `SELECT t.*, pd.payment_reference as tranRef, pd.payment_date as transactionDateTime,
                pd.gateway_response, pd.amount_paid as amount
         FROM \`GS1_transactions\` t
         LEFT JOIN \`GS1_payment_details\` pd ON t.id = pd.transaction_id
         WHERE t.invoice_number = ?
         ORDER BY pd.created_at DESC
         LIMIT 1`,
        [invoiceNo]
      )

      if (transactions.length === 0) {
        return NextResponse.json(
          { 
            error: 'GS1 Transaction not found',
            details: 'No transaction found for this invoice number' 
          },
          { status: 404 }
        )
      }

      const transaction = transactions[0]
      
      // Parse gateway response if exists
      let gatewayData: any = {}
      if (transaction.gateway_response) {
        try {
          gatewayData = JSON.parse(transaction.gateway_response)
        } catch (e) {
          console.error('Failed to parse gateway response:', e)
        }
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

      return NextResponse.json({
        success: true,
        data: inquiryResponse
      })

    } finally {
      connection.release()
    }

  } catch (error) {
    console.error('GS1 Payment inquiry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
