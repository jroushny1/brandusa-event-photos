import { NextRequest, NextResponse } from 'next/server'
import { createAssetRecord } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  try {
    console.log('=== METADATA SAVE REQUEST ===')
    const { key, originalFilename, publicUrl, fileType, mimeType, size, metadata } = await request.json()

    console.log('Asset details:', { key, originalFilename, fileType, size })
    console.log('Metadata:', metadata)

    if (!metadata.event || !metadata.date) {
      console.log('ERROR: Missing required metadata fields')
      return NextResponse.json({ success: false, error: 'Missing required metadata fields' }, { status: 400 })
    }

    // Create asset record in Airtable
    console.log('Starting Airtable record creation...')
    const assetData = {
      filename: key,
      originalFilename,
      url: publicUrl,
      fileType,
      mimeType,
      size,
      width: undefined,
      height: undefined,
      duration: undefined,
      uploadedAt: new Date().toISOString(),
      event: metadata.event,
      date: metadata.date,
      location: metadata.location || '',
      photographer: metadata.photographer || '',
      tags: metadata.tags || [],
      description: metadata.description || '',
    }
    console.log('Asset data to create:', assetData)

    const asset = await createAssetRecord(assetData)
    console.log('Airtable record created with ID:', asset.id)

    return NextResponse.json({
      success: true,
      asset: {
        id: asset.id,
        filename: originalFilename,
        url: publicUrl,
      }
    })
  } catch (error: any) {
    console.error('=== METADATA SAVE ERROR ===')
    console.error('Error:', error)

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to save metadata'
    }, { status: 500 })
  }
}