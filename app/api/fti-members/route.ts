import { NextRequest, NextResponse } from 'next/server'
import { getFtiMemberByCode, getFtiMemberByTaxId } from '@/lib/mssql'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const searchBy = searchParams.get('searchBy') as 'memberCode' | 'taxId' || 'memberCode'

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Searching FTI member by ${searchBy}:`, query)

    let memberData = null

    try {
      if (searchBy === 'memberCode') {
        memberData = await getFtiMemberByCode(query.trim())
      } else if (searchBy === 'taxId') {
        memberData = await getFtiMemberByTaxId(query.trim())
      } else {
        return NextResponse.json(
          { error: 'Invalid searchBy parameter. Use "memberCode" or "taxId"' },
          { status: 400 }
        )
      }
    } catch (mssqlError) {
      console.error('MSSQL Error:', mssqlError)
      return NextResponse.json(
        { 
          error: 'Failed to connect to FTI member database',
          details: mssqlError instanceof Error ? mssqlError.message : 'Database connection error'
        },
        { status: 500 }
      )
    }

    if (!memberData) {
      return NextResponse.json(
        { 
          success: false,
          message: 'ไม่พบ หมายเลขสมาชิก ที่ท่านค้นหา โปรดตรวจสอบอีกครั้ง',
          data: null
        },
        { status: 404 }
      )
    }

    console.log('✅ Found FTI member:', memberData)

    return NextResponse.json({
      success: true,
      message: 'FTI member found successfully',
      data: {
        memberCode: memberData.MEMBER_CODE,
        taxId: memberData.TAX_ID,
        companyName: memberData.COMPANY_NAME
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, searchBy = 'memberCode' } = await request.json()

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Searching FTI member by ${searchBy}:`, query)

    let memberData = null

    try {
      if (searchBy === 'memberCode') {
        memberData = await getFtiMemberByCode(query.trim())
      } else if (searchBy === 'taxId') {
        memberData = await getFtiMemberByTaxId(query.trim())
      } else {
        return NextResponse.json(
          { error: 'Invalid searchBy parameter. Use "memberCode" or "taxId"' },
          { status: 400 }
        )
      }
    } catch (mssqlError) {
      console.error('MSSQL Error:', mssqlError)
      return NextResponse.json(
        { 
          error: 'Failed to connect to FTI member database',
          details: mssqlError instanceof Error ? mssqlError.message : 'Database connection error'
        },
        { status: 500 }
      )
    }

    if (!memberData) {
      return NextResponse.json(
        { 
          success: false,
          message: 'ไม่พบ หมายเลขสมาชิก ที่ท่านค้นหา โปรดตรวจสอบอีกครั้ง',
          data: null
        },
        { status: 404 }
      )
    }

    console.log('✅ Found FTI member:', memberData)

    return NextResponse.json({
      success: true,
      message: 'FTI member found successfully',
      data: {
        memberCode: memberData.MEMBER_CODE,
        taxId: memberData.TAX_ID,
        companyName: memberData.COMPANY_NAME
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
