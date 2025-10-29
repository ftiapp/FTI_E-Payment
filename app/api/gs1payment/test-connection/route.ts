import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Test different 2C2P URLs to find the correct one
    const testUrls = [
      'https://pgw.2c2p.com/payment/4.3/PaymentToken',
      'https://sandbox-pgw.2c2p.com/payment/4.3/PaymentToken',
      'https://2c2p.2c2p.com/payment/4.3/PaymentToken',
      'https://sandbox-2c2p.2c2p.com/payment/4.3/PaymentToken'
    ]

    const results = []

    for (const url of testUrls) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            merchantID: 'TEST',
            invoiceNo: 'GS1TEST123',
            description: 'GS1 test',
            amount: 1.00,
            currencyCode: 'THB'
          }),
          signal: AbortSignal.timeout(5000) // 5 second timeout
        })

        results.push({
          url,
          status: response.status,
          success: true,
          message: 'GS1 Connected successfully'
        })
      } catch (error) {
        results.push({
          url,
          status: 'ERROR',
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
