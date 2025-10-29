import { NextResponse } from 'next/server'
import { testBoxConnection } from '@/lib/box'

export async function GET() {
  try {
    const message = await testBoxConnection()
    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    console.error('Box connection test failed:', error)

    // Check if it's an authorization error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isAuthError = errorMessage.toLowerCase().includes('authorization') ||
                       errorMessage.toLowerCase().includes('unauthorized') ||
                       errorMessage.toLowerCase().includes('not approved')

    if (isAuthError) {
      return NextResponse.json({
        success: false,
        warning: true,
        error: 'Box app not yet authorized by admin. Please contact your Box administrator to authorize the app in the Admin Console.',
      })
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
    })
  }
}
