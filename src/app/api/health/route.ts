import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Check if data file exists and is readable
    const dataPath = path.join(process.cwd(), 'data', 'items.json')
    const dataExists = fs.existsSync(dataPath)

    if (!dataExists) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Data file not found',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }

    // Try to read and parse the data file
    let itemCount = 0
    try {
      const data = fs.readFileSync(dataPath, 'utf8')
      const items = JSON.parse(data)
      itemCount = Array.isArray(items) ? items.length : 0
    } catch (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Data file corrupted',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }

    // Check environment variables
    const requiredEnvVars = ['NEXTAUTH_SECRET', 'AUTH_USERNAME', 'AUTH_PASSWORD']
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])

    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        {
          status: 'warning',
          message: `Missing environment variables: ${missingEnvVars.join(', ')}`,
          timestamp: new Date().toISOString(),
          itemCount
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Service is running correctly',
      timestamp: new Date().toISOString(),
      itemCount,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    })

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
