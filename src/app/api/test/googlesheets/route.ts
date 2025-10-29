import { NextResponse } from 'next/server'
import { testGoogleSheetsConnection } from '@/lib/googlesheets'

export async function GET() {
  try {
    const message = await testGoogleSheetsConnection()
    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    console.error('Google Sheets connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
