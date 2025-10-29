import { NextRequest, NextResponse } from 'next/server'
import { generateAssetKey, getPresignedUrl } from '@/lib/r2'

export async function POST(request: NextRequest) {
  try {
    console.log('=== PRESIGNED URL REQUEST ===')
    const { fileName, fileType, fileSize } = await request.json()

    console.log('File details:', { fileName, fileType, fileSize })

    // Generate unique key for R2
    const key = generateAssetKey(fileName)
    console.log('Generated key:', key)

    // Get presigned URL for direct upload
    const presignedUrl = await getPresignedUrl(key, fileType)
    console.log('Generated presigned URL')

    return NextResponse.json({
      success: true,
      presignedUrl,
      key,
      publicUrl: `${process.env.CLOUDFLARE_PUBLIC_URL}/${key}`
    })
  } catch (error: any) {
    console.error('=== PRESIGNED URL ERROR ===')
    console.error('Error:', error)

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate presigned URL'
    }, { status: 500 })
  }
}