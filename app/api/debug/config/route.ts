import { NextResponse } from 'next/server'

export async function GET() {
  const config = {
    environment: process.env.NODE_ENV,
    c2pEnvironment: process.env.NEXT_PUBLIC_2C2P_ENVIRONMENT || 'sandbox',
    merchantId: process.env.NEXT_PUBLIC_2C2P_MERCHANT_ID ? 'SET' : 'MISSING',
    ftiSecretKey: process.env.FTI_2C2P_SECRET_KEY ? 'SET' : 'MISSING',
    gs1SecretKey: process.env.GS1_2C2P_SECRET_KEY ? 'SET' : 'MISSING',
    backendReturnUrl: process.env.NEXT_PUBLIC_2C2P_BACKEND_RETURN_URL ? 'SET' : 'MISSING',
    frontendReturnUrl: process.env.NEXT_PUBLIC_2C2P_FRONTEND_RETURN_URL ? 'SET' : 'MISSING',
    currencyCode: process.env.NEXT_PUBLIC_2C2P_CURRENCY_CODE || 'THB',
    dbHost: process.env.DB_HOST ? 'SET' : 'MISSING',
    dbName: process.env.DB_NAME || 'MISSING',
  }

  return NextResponse.json({
    message: 'Configuration Debug Info',
    config: config,
    timestamp: new Date().toISOString()
  })
}
