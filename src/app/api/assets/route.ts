import { NextRequest, NextResponse } from 'next/server'
import { getAssets, searchAssets } from '@/lib/googlesheets'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageSize = parseInt(searchParams.get('pageSize') || '100')
    const offset = searchParams.get('offset') || undefined

    // Check if this is a search request
    const event = searchParams.get('event') || undefined
    const photographer = searchParams.get('photographer') || undefined
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || undefined
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined

    if (event || photographer || tags || dateFrom || dateTo) {
      // This is a search request
      const assets = await searchAssets({
        event,
        photographer,
        tags,
        dateFrom,
        dateTo
      })
      return NextResponse.json({ records: assets })
    } else {
      // This is a regular fetch request
      const result = await getAssets(pageSize, offset)
      return NextResponse.json(result)
    }
  } catch (error) {
    console.error('Error fetching assets:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
      errorObject: error
    })
    console.error('Environment variables check:', {
      hasGoogleSheetsId: !!process.env.GOOGLE_SHEETS_ID,
      hasServiceAccountEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
    })

    return NextResponse.json(
      {
        error: 'Failed to fetch assets',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}