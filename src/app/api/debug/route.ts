import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    environment: {
      AIRTABLE_ACCESS_TOKEN: process.env.AIRTABLE_ACCESS_TOKEN ? 'SET' : 'NOT SET',
      AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID ? 'SET' : 'NOT SET',
      AIRTABLE_TABLE_NAME: process.env.AIRTABLE_TABLE_NAME || 'NOT SET',
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID ? 'SET' : 'NOT SET',
      CLOUDFLARE_ACCESS_KEY_ID: process.env.CLOUDFLARE_ACCESS_KEY_ID ? 'SET' : 'NOT SET',
      CLOUDFLARE_SECRET_ACCESS_KEY: process.env.CLOUDFLARE_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET',
      CLOUDFLARE_BUCKET_NAME: process.env.CLOUDFLARE_BUCKET_NAME || 'NOT SET',
      CLOUDFLARE_PUBLIC_URL: process.env.CLOUDFLARE_PUBLIC_URL || 'NOT SET',
    },
    nodeVersion: process.version,
    platform: process.platform,
    timestamp: new Date().toISOString()
  })
}