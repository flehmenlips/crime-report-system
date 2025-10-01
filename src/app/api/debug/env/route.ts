import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const envCheck = {
      // Email configuration
      RESEND_API_KEY: process.env.RESEND_API_KEY ? 
        `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 
        'NOT SET',
      EMAIL_FROM: process.env.EMAIL_FROM || 'NOT SET',
      EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO || 'NOT SET',
      
      // Database
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      
      // App URLs
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
      
      // Other
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
      PORT: process.env.PORT || 'NOT SET'
    }
    
    return NextResponse.json({
      success: true,
      environment: envCheck,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
