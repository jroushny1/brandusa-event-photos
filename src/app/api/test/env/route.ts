import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const requiredVars = [
      'BOX_CLIENT_ID',
      'BOX_CLIENT_SECRET',
      'BOX_ENTERPRISE_ID',
      'BOX_PUBLIC_KEY_ID',
      'BOX_PRIVATE_KEY',
      'BOX_PASSPHRASE',
      'GOOGLE_SHEETS_ID',
      'GOOGLE_SERVICE_ACCOUNT_EMAIL',
      'GOOGLE_PRIVATE_KEY'
    ]

    const missingVars = requiredVars.filter(varName => !process.env[varName])
    const hasPlaceholders = requiredVars.filter(varName => {
      const value = process.env[varName]
      return value && (
        value.includes('your_') ||
        value.includes('_here') ||
        value === 'Assets' // old default table name
      )
    })

    const allVarsSet = missingVars.length === 0 && hasPlaceholders.length === 0

    return NextResponse.json({
      success: allVarsSet,
      missingVars,
      hasPlaceholders,
      message: allVarsSet
        ? 'All environment variables are properly configured'
        : `Issues found: ${[...missingVars, ...hasPlaceholders.map(v => `${v} has placeholder value`)].join(', ')}`
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check environment variables'
    }, { status: 500 })
  }
}