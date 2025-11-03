import { NextRequest, NextResponse } from 'next/server'
import sql from 'mssql'

const sqlConfig = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER || '',
  database: process.env.MSSQL_DATABASE || 'FTI',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
}

export async function GET(request: NextRequest) {
  let pool: sql.ConnectionPool | null = null
  
  try {
    const { searchParams } = new URL(request.url)
    const invoiceNo = searchParams.get('invoiceNo')
    const taxId = searchParams.get('taxId')

    if (!invoiceNo && !taxId) {
      return NextResponse.json(
        { error: 'กรุณาระบุเลขใบแจ้งหนี้ และ เลขประจำตัวผู้เสียภาษี' },
        { status: 400 }
      )
    }

    if (!invoiceNo || !taxId) {
      return NextResponse.json(
        { error: 'กรุณาระบุทั้งเลขใบแจ้งหนี้ และ เลขประจำตัวผู้เสียภาษี' },
        { status: 400 }
      )
    }

    // Connect and store the pool
    pool = await sql.connect(sqlConfig)

    let query = `
      SELECT 
        [IV_TRAN_NO],
        [MEMBER_CODE],
        [TAX_ID],
        [Tracking_Number],
        [Shipping_Date],
        [Shipping_To],
        [TRAN_DATE]
      FROM [FTI].[dbo].[API_GET_MAIL_TRACKING]
      WHERE [IV_TRAN_NO] = @invoiceNo AND [TAX_ID] = @taxId
    `

    // Create request from pool
    const requestQuery = pool.request()
    
    requestQuery.input('invoiceNo', sql.NVarChar, invoiceNo)
    requestQuery.input('taxId', sql.NVarChar, taxId)

    const result = await requestQuery.query(query)

    // Close the pool (not sql)
    await pool.close()

    return NextResponse.json(result.recordset)

  } catch (error) {
    console.error('Database error:', error)
    
    // Clean up pool if it exists
    if (pool) {
      await pool.close()
    }

    return NextResponse.json(
      { error: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้' },
      { status: 500 }
    )
  }
}