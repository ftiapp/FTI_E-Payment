import { NextResponse } from 'next/server'

export async function GET() {
  const config = {
    environment: process.env.NODE_ENV,
    c2pEnvironment: process.env.NEXT_PUBLIC_2C2P_ENVIRONMENT || 'sandbox',
    merchantId: process.env.NEXT_PUBLIC_2C2P_MERCHANT_ID || 'MISSING',
    secretCode: process.env.NEXT_PUBLIC_2C2P_SECRET_CODE ? 'SET' : 'MISSING',
    backendReturnUrl: process.env.NEXT_PUBLIC_2C2P_BACKEND_RETURN_URL || 'MISSING',
    frontendReturnUrl: process.env.NEXT_PUBLIC_2C2P_FRONTEND_RETURN_URL || 'MISSING',
    currencyCode: process.env.NEXT_PUBLIC_2C2P_CURRENCY_CODE || 'THB',
    dbHost: process.env.DB_HOST || 'MISSING',
    dbName: process.env.DB_NAME || 'MISSING',
  }

  return NextResponse.json({
    message: 'Configuration Debug Info',
    config: config,
    timestamp: new Date().toISOString()
  })
}
