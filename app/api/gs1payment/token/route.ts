import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { invoiceNo, amount, description } = await request.json()

    // Generate unique invoice number if not provided or to avoid duplicates
    const uniqueInvoiceNo = invoiceNo ? `GS1-${invoiceNo}-${Date.now()}` : `GS1-INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // 2C2P Configuration
    const merchantID = process.env.NEXT_PUBLIC_2C2P_MERCHANT_ID
    const secretCode = process.env.NEXT_PUBLIC_2C2P_SECRET_CODE
    const currencyCode = process.env.NEXT_PUBLIC_2C2P_CURRENCY_CODE || 'THB'
    const backendReturnUrl = process.env.NEXT_PUBLIC_2C2P_BACKEND_RETURN_URL
    const frontendReturnUrl = process.env.NEXT_PUBLIC_2C2P_FRONTEND_RETURN_URL

    if (!merchantID || !secretCode) {
      return NextResponse.json(
        { error: 'Missing 2C2P configuration' },
        { status: 500 }
      )
    }

    // Prepare payment token request payload
    const paymentPayload = {
      "merchantID": merchantID,
      "invoiceNo": uniqueInvoiceNo,
      "description": description || "item 1",
      "amount": parseFloat(amount),
      "currencyCode": currencyCode,
      "paymentChannel": ["CC"],
      "request3DS": "",
      "tokenize": false,
      "cardTokens": [],
      "cardTokenOnly": false,
      "tokenizeOnly": false,
      "interestType": "",
      "installmentPeriodFilter": [],
      "productCode": "",
      "recurring": false,
      "invoicePrefix": "GS1",
      "recurringAmount": 0,
      "allowAccumulate": false,
      "maxAccumulateAmount": 0,
      "recurringInterval": 0,
      "recurringCount": 0,
      "chargeNextDate": "",
      "chargeOnDate": "",
      "paymentExpiry": "",
      "promotionCode": "",
      "paymentRouteID": "",
      "fxProviderCode": "",
      "immediatePayment": false,
      "userDefined1": "",
      "userDefined2": "",
      "userDefined3": "",
      "userDefined4": "",
      "userDefined5": "",
      "statementDescriptor": "",
      "subMerchants": [],
      "locale": "en",
      "frontendReturnUrl": frontendReturnUrl || "",
      "backendReturnUrl": backendReturnUrl || "",
      "nonceStr": Math.random().toString(36).substring(2, 15),
      "uiParams": {},
      "iat": Math.floor(Date.now() / 1000)
    }

    // Generate JWT token for 2C2P API
    const paymentToken = jwt.sign(paymentPayload, secretCode, { algorithm: 'HS256' })
    
    // Prepare request with JWT payload
    const paymentRequest = {
      "payload": paymentToken
    }

    // Call 2C2P Payment Token API
    const apiUrl = process.env.NEXT_PUBLIC_2C2P_ENVIRONMENT === 'production' 
      ? 'https://pgw.2c2p.com/payment/4.3/PaymentToken' 
      : 'https://sandbox-pgw.2c2p.com/payment/4.3/PaymentToken'

    console.log('GS1 2C2P Environment:', process.env.NEXT_PUBLIC_2C2P_ENVIRONMENT)
    console.log('Merchant ID:', merchantID)
    console.log('GS1 2C2P API URL:', apiUrl)
    console.log('GS1 2C2P Payload:', paymentPayload)
    console.log('GS1 2C2P Request:', paymentRequest)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(paymentRequest)
    })

    const tokenResponse = await response.json()

    // Log the full response for debugging
    console.log('GS1 2C2P Response Status:', response.status)
    console.log('GS1 2C2P Response Body:', tokenResponse)

    // Decode JWT response from 2C2P
    let decodedResponse
    try {
      decodedResponse = jwt.verify(tokenResponse.payload, secretCode, { algorithms: ['HS256'] })
      console.log('Decoded GS1 2C2P Response:', decodedResponse)
    } catch (error) {
      console.error('Failed to decode GS1 2C2P response:', error)
      decodedResponse = tokenResponse // Fallback to raw response
    }

    if (decodedResponse.respCode !== '0000') {
      return NextResponse.json(
        { 
          error: 'Failed to get GS1 payment token',
          details: decodedResponse.respDesc,
          respCode: decodedResponse.respCode,
          fullResponse: decodedResponse
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      paymentToken: decodedResponse.paymentToken,
      webPaymentUrl: decodedResponse.webPaymentUrl,
      respCode: decodedResponse.respCode,
      respDesc: decodedResponse.respDesc
    })

  } catch (error) {
    console.error('GS1 Payment token error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
