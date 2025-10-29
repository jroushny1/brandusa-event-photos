import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2, generateAssetKey } from '@/lib/r2'
import { createAssetRecord } from '@/lib/airtable'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

export async function POST(request: NextRequest) {
  try {
    console.log('=== API UPLOAD START ===')

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const metadataString = formData.get('metadata') as string
    const batchMode = formData.get('batchMode') === 'true'

    console.log('Files received:', files.length)
    console.log('Metadata string:', metadataString)
    console.log('Batch mode:', batchMode)

    if (!files || files.length === 0) {
      console.log('ERROR: No files provided')
      return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 })
    }

    const metadata = JSON.parse(metadataString)
    console.log('Parsed metadata:', metadata)

    if (!metadata.event || !metadata.date) {
      console.log('ERROR: Missing required metadata fields')
      return NextResponse.json({ success: false, error: 'Missing required metadata fields' }, { status: 400 })
    }

    const uploadResults = []

    for (const file of files) {
      try {
        console.log(`--- Processing file: ${file.name} ---`)
        console.log('File size:', file.size)
        console.log('File type:', file.type)

        // Generate unique key for R2
        const key = generateAssetKey(file.name)
        console.log('Generated key:', key)

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        console.log('Buffer size:', buffer.length)

        // Upload to R2
        console.log('Starting R2 upload...')
        const publicUrl = await uploadToR2(key, buffer, file.type)
        console.log('R2 upload complete. Public URL:', publicUrl)

        const fileType: 'image' | 'video' = file.type.startsWith('image/') ? 'image' : 'video'
        console.log('Detected file type:', fileType)

        // Create asset record in Airtable
        console.log('Starting Airtable record creation...')
        const assetData = {
          filename: key,
          originalFilename: file.name,
          url: publicUrl,
          fileType,
          mimeType: file.type,
          size: file.size,
          width: undefined,
          height: undefined,
          duration: undefined,
          uploadedAt: new Date().toISOString(),
          event: metadata.event,
          date: metadata.date,
          photographer: metadata.photographer || '',
          tags: metadata.tags || [],
          description: metadata.description || '',
        }
        console.log('Asset data to create:', assetData)

        const asset = await createAssetRecord(assetData)
        console.log('Airtable record created with ID:', asset.id)

        uploadResults.push({
          id: asset.id,
          filename: file.name,
          url: publicUrl,
        })
        console.log(`--- File ${file.name} processed successfully ---`)
      } catch (fileError: any) {
        console.error(`=== ERROR uploading file ${file.name} ===`)
        console.error('Error type:', typeof fileError)
        console.error('Error message:', fileError?.message || 'No message')
        console.error('Error stack:', fileError?.stack || 'No stack')
        console.error('Full error:', fileError)

        const errorMessage = fileError?.message || 'Unknown error'
        return NextResponse.json({
          success: false,
          error: `Failed to upload ${file.name}: ${errorMessage}`
        }, { status: 500 })
      }
    }

    console.log('=== UPLOAD SUCCESS ===')
    console.log('Upload results:', uploadResults)

    return NextResponse.json({
      success: true,
      assets: uploadResults,
    })
  } catch (error: any) {
    console.error('=== TOP LEVEL API UPLOAD ERROR ===')
    console.error('Error type:', typeof error)
    console.error('Error message:', error?.message || 'No message')
    console.error('Error stack:', error?.stack || 'No stack')
    console.error('Raw error object:', error)

    const errorMessage = error?.message || 'Upload failed'
    return NextResponse.json({
      success: false,
      error: errorMessage,
    }, { status: 500 })
  }
}