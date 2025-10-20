import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Test direct Resend API call
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Crime Report System <onboarding@resend.dev>',
      to: [email],
      subject: 'Direct Resend Test - REMISE System',
      html: `
        <h1>Direct Resend Test</h1>
        <p>This is a direct test of the Resend API to debug email delivery issues.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
        <p>From: ${process.env.EMAIL_FROM}</p>
        <p>API Key: ${process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 10) + '...' : 'Not set'}</p>
      `
    })

    return NextResponse.json({
      success: true,
      result: result,
      debug: {
        from: process.env.EMAIL_FROM,
        apiKeyPrefix: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 10) + '...' : 'Not set',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Direct Resend test error:', error)
    return NextResponse.json({ 
      error: 'Direct Resend test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
