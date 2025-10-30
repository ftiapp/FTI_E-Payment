import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Helper function to provide troubleshooting information
function getErrorCauses(respCode: string): string[] {
  const causes: { [key: string]: string[] } = {
    '9042': [
      'Invalid request format',
      'Missing required fields in payload',
      'Invalid JWT token structure',
      'Production environment using sandbox credentials'
    ],
    '9015': [
      'Invoice number already exists in 2C2P system',
      'Duplicate transaction attempt'
    ],
    '9001': [
      'Invalid Merchant ID',
      'Invalid Secret Code',
      'Merchant not active'
    ],
    '4001': [
      'JWT signature verification failed',
      'Incorrect Secret Code used for signing'
    ]
  }
  return causes[respCode] || ['Unknown error']
}

export async function POST(request: NextRequest) {
  try {
    const { invoiceNo, amount, description, userDefined1, userDefined2, userDefined3, userDefined4, userDefined5 } = await request.json()

    // Use original invoice number (no timestamp) to match database records
    const finalInvoiceNo = invoiceNo || `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // FTI 2C2P Configuration (Support both legacy and new patterns)
    const merchantID = process.env.FTI_2C2P_MERCHANT_ID || process.env.NEXT_PUBLIC_2C2P_MERCHANT_ID
    const secretCode = process.env.FTI_2C2P_SECRET_KEY || process.env.NEXT_PUBLIC_2C2P_SECRET_CODE
    const currencyCode = process.env.NEXT_PUBLIC_2C2P_CURRENCY_CODE || 'THB'
    const backendReturnUrl = process.env.NEXT_PUBLIC_2C2P_BACKEND_RETURN_URL
    const frontendReturnUrl = "https://ftie-payment-7vekz.kinsta.app/payment" // Override to redirect to /payment instead of /payment/result

    console.log('🔧 FTI 2C2P Configuration Check:')
    console.log('- Merchant ID:', merchantID ? 'SET' : 'MISSING')
    console.log('- Secret Code:', secretCode ? 'SET' : 'MISSING')
    console.log('- Using FTI_2C2P_* env vars:', !!process.env.FTI_2C2P_MERCHANT_ID)
    console.log('- Using NEXT_PUBLIC_2C2P_* env vars (legacy):', !!process.env.NEXT_PUBLIC_2C2P_MERCHANT_ID)
    console.log('- Backend Return URL:', backendReturnUrl || 'MISSING')
    console.log('- Frontend Return URL:', frontendReturnUrl || 'MISSING')
    console.log('- Environment:', process.env.NEXT_PUBLIC_2C2P_ENVIRONMENT || 'sandbox')

    if (!merchantID || !secretCode) {
      return NextResponse.json(
        { error: 'Missing FTI 2C2P configuration - Set either FTI_2C2P_* or NEXT_PUBLIC_2C2P_* environment variables' },
        { status: 500 }
      )
    }

    // Prepare payment token request payload
    const paymentPayload = {
      "merchantID": merchantID,
      "invoiceNo": finalInvoiceNo,
      "description": description || "item 1",
      "amount": parseFloat(amount),
      "currencyCode": currencyCode,
      "paymentChannel": ["CC"], // Ensure correct format
      "request3DS": "",
      "tokenize": false,
      "cardTokens": [],
      "cardTokenOnly": false,
      "tokenizeOnly": false,
      "interestType": "",
      "installmentPeriodFilter": [],
      "productCode": "",
      "recurring": false,
      "invoicePrefix": "",
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
      "userDefined1": userDefined1 || "",
      "userDefined2": userDefined2 || "",
      "userDefined3": userDefined3 || "",
      "userDefined4": userDefined4 || "",
      "userDefined5": userDefined5 || "",
      "statementDescriptor": "",
      "subMerchants": [],
      "locale": "en",
      "frontendReturnUrl": frontendReturnUrl || "",
      "backendReturnUrl": backendReturnUrl || "",
      "nonceStr": Math.random().toString(36).substring(2, 15),
      "uiParams": {},
      "iat": Math.floor(Date.now() / 1000)
    }

    // Validate payload before sending
    console.log('🔍 Validating payment payload:')
    console.log('- Environment:', process.env.NEXT_PUBLIC_2C2P_ENVIRONMENT)
    console.log('- Merchant ID:', merchantID)
    console.log('- Original Invoice No:', invoiceNo)
    console.log('- Final Invoice No:', finalInvoiceNo)
    console.log('- Amount:', parseFloat(amount))
    console.log('- Backend Return URL:', backendReturnUrl)
    console.log('- Frontend Return URL:', frontendReturnUrl)
    
    // Production-specific validations
    if (process.env.NEXT_PUBLIC_2C2P_ENVIRONMENT === 'production') {
      console.log('🚀 PRODUCTION MODE - Additional validations:')
      
      if (!merchantID || merchantID === 'JT04') {
        console.error('❌ Production requires valid Merchant ID (not sandbox JT04)')
        return NextResponse.json(
          { error: 'Invalid Production Merchant ID' },
          { status: 500 }
        )
      }
      
      if (parseFloat(amount) < 10) {
        console.warn('⚠️ Warning: Amount might be too low for production testing')
      }
      
      if (!backendReturnUrl || !backendReturnUrl.includes('https://')) {
        console.error('❌ Production requires HTTPS backend return URL')
        return NextResponse.json(
          { error: 'Production requires HTTPS backend return URL' },
          { status: 500 }
        )
      }
      
      if (!frontendReturnUrl || !frontendReturnUrl.includes('https://')) {
        console.error('❌ Production requires HTTPS frontend return URL')
        return NextResponse.json(
          { error: 'Production requires HTTPS frontend return URL' },
          { status: 500 }
        )
      }
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

    console.log('2C2P Environment:', process.env.NEXT_PUBLIC_2C2P_ENVIRONMENT)
    console.log('Merchant ID:', merchantID)
    console.log('2C2P API URL:', apiUrl)
    console.log('2C2P Payload:', paymentPayload)
    console.log('2C2P Request:', paymentRequest)

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
    console.log('2C2P Response Status:', response.status)
    console.log('2C2P Response Body:', tokenResponse)

    // Decode JWT response from 2C2P
    let decodedResponse
    try {
      // Check if response has payload (JWT)
      if (!tokenResponse.payload) {
        console.error('❌ 2C2P Error Response - No JWT payload:', tokenResponse)
        
        // Provide specific error handling for common error codes
        const errorDetails = {
          '9042': 'Invalid request format or missing required fields',
          '9015': 'Invoice number already exists',
          '9001': 'Invalid merchant ID or secret code',
          '4001': 'Invalid signature'
        }
        
        return NextResponse.json(
          { 
            error: '2C2P API Error',
            details: tokenResponse.respDesc || errorDetails[tokenResponse.respCode as keyof typeof errorDetails] || 'Unknown error',
            respCode: tokenResponse.respCode,
            fullResponse: tokenResponse,
            troubleshooting: {
              environment: process.env.NEXT_PUBLIC_2C2P_ENVIRONMENT,
              merchantId: merchantID,
              possibleCauses: getErrorCauses(tokenResponse.respCode as string)
            }
          },
          { status: 400 }
        )
      }

      decodedResponse = jwt.verify(tokenResponse.payload, secretCode, { algorithms: ['HS256'] })
      console.log('✅ Decoded 2C2P Response:', decodedResponse)
      
      // Type guard to ensure decodedResponse is an object with respCode
      if (typeof decodedResponse !== 'object' || decodedResponse === null || !('respCode' in decodedResponse)) {
        console.error('❌ Invalid decoded response format:', decodedResponse)
        return NextResponse.json(
          { 
            error: 'Invalid response format from 2C2P',
            fullResponse: decodedResponse
          },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error('❌ Failed to decode 2C2P response:', error)
      console.error('Response received:', tokenResponse)
      return NextResponse.json(
        { 
          error: 'Failed to decode 2C2P response',
          details: error instanceof Error ? error.message : 'JWT decode error',
          respCode: (tokenResponse.respCode as string) || 'JWT_ERROR',
          fullResponse: tokenResponse
        },
        { status: 400 }
      )
    }

    if ((decodedResponse as any).respCode !== '0000') {
      return NextResponse.json(
        { 
          error: 'Failed to get payment token',
          details: (decodedResponse as any).respDesc,
          respCode: (decodedResponse as any).respCode,
          fullResponse: decodedResponse
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      paymentToken: (decodedResponse as any).paymentToken,
      webPaymentUrl: (decodedResponse as any).webPaymentUrl,
      fullResponse: decodedResponse
    })

  } catch (error) {
    console.error('Payment token error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
