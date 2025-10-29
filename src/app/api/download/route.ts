import { NextRequest, NextResponse } from 'next/server'
import { getSignedDownloadUrl } from '@/lib/r2'

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json()

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      )
    }

    const downloadUrl = await getSignedDownloadUrl(filename)
    return NextResponse.json({ downloadUrl })
  } catch (error) {
    console.error('Error generating download URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    )
  }
}