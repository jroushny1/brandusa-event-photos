import { NextRequest, NextResponse } from 'next/server'
import { getBoxDownloadUrl } from '@/lib/box'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      )
    }

    // Get direct download URL from Box
    const downloadUrl = await getBoxDownloadUrl(fileId)

    // Return the download URL
    return NextResponse.json({ url: downloadUrl })
  } catch (error: any) {
    console.error('Error getting Box download URL:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get download URL' },
      { status: 500 }
    )
  }
}
