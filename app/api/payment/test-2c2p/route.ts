import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Use exact example from 2C2P documentation
    const exactExample = {
      "merchantID": "JT01",
      "invoiceNo": "1523953661",
      "description": "item 1",
      "amount": 1000.00,
      "currencyCode": "SGD",
      "paymentChannel": ["CC"] //Specify which payment option
    }

    console.log('Testing with exact 2C2P example:', exactExample)

    const apiUrl = 'https://sandbox-pgw.2c2p.com/payment/4.3/PaymentToken'

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(exactExample)
    })

    const tokenResponse = await response.json()

    console.log('2C2P Test Response Status:', response.status)
    console.log('2C2P Test Response Body:', tokenResponse)

    return NextResponse.json({
      success: true,
      status: response.status,
      response: tokenResponse
    })

  } catch (error) {
    console.error('2C2P Test Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
