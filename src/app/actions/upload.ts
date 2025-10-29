'use server'

import { uploadToBox, generateAssetKey } from '@/lib/box'
import { createAssetRecord } from '@/lib/googlesheets'
import { AssetMetadata } from '@/types'

interface UploadResult {
  success: boolean
  error?: string
  assets?: Array<{ id: string; filename: string; url: string }>
}

export async function uploadAssets(formData: FormData): Promise<UploadResult> {
  try {
    console.log('=== UPLOAD START ===')
    const files = formData.getAll('files') as File[]
    const metadataString = formData.get('metadata') as string
    const batchMode = formData.get('batchMode') === 'true'

    console.log('Files received:', files.length)
    console.log('Metadata string:', metadataString)
    console.log('Batch mode:', batchMode)

    if (!files || files.length === 0) {
      console.log('ERROR: No files provided')
      return { success: false, error: 'No files provided' }
    }

    const metadata: AssetMetadata = JSON.parse(metadataString)
    console.log('Parsed metadata:', metadata)

    if (!metadata.event || !metadata.date) {
      console.log('ERROR: Missing required metadata fields')
      return { success: false, error: 'Missing required metadata fields' }
    }

    const uploadResults = []

    for (const file of files) {
      try {
        console.log(`--- Processing file: ${file.name} ---`)
        console.log('File size:', file.size)
        console.log('File type:', file.type)

        // Generate unique key for Box
        const key = generateAssetKey(file.name)
        console.log('Generated key:', key)

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        console.log('Buffer size:', buffer.length)

        // Upload to Box
        console.log('Starting Box upload...')
        const { fileId, url } = await uploadToBox(key, buffer, file.type)
        console.log('Box upload complete. File ID:', fileId, 'URL:', url)

        // Get file dimensions/metadata if it's an image or video
        let width: number | undefined
        let height: number | undefined
        let duration: number | undefined

        const fileType: 'image' | 'video' = file.type.startsWith('image/') ? 'image' : 'video'
        console.log('Detected file type:', fileType)

        // For images, we could extract dimensions here using a library like sharp
        // For videos, we could extract metadata using ffprobe
        // For now, we'll leave these undefined and handle on the client side if needed

        // Create asset record in Google Sheets
        console.log('Starting Google Sheets record creation...')
        const assetData = {
          filename: key,
          originalFilename: file.name,
          boxFileId: fileId,
          url: url, // Use the shared link URL as the main URL
          fileType,
          mimeType: file.type,
          size: file.size,
          width,
          height,
          duration,
          uploadedAt: new Date().toISOString(),
          event: metadata.event,
          date: metadata.date,
          location: metadata.location,
          photographer: metadata.photographer,
          tags: metadata.tags,
          description: metadata.description,
        }
        console.log('Asset data to create:', assetData)

        const asset = await createAssetRecord(assetData)
        console.log('Google Sheets record created with ID:', asset.id)

        uploadResults.push({
          id: asset.id,
          filename: file.name,
          url: url,
        })
        console.log(`--- File ${file.name} processed successfully ---`)
      } catch (fileError: any) {
        console.error(`=== ERROR uploading file ${file.name} ===`)
        console.error('Error type:', typeof fileError)
        console.error('Error message:', fileError?.message || 'No message')
        console.error('Error stack:', fileError?.stack || 'No stack')
        console.error('Error name:', fileError?.name || 'No name')
        console.error('Error code:', fileError?.code || 'No code')
        console.error('Error details:', fileError)

        // Try to extract a meaningful error message
        let errorMessage = 'Unknown error'
        if (fileError?.message) {
          errorMessage = fileError.message
        } else if (fileError?.error) {
          errorMessage = fileError.error
        } else if (fileError?.statusText) {
          errorMessage = fileError.statusText
        } else if (typeof fileError === 'string') {
          errorMessage = fileError
        }

        return {
          success: false,
          error: `Failed to upload ${file.name}: ${errorMessage}`
        }
      }
    }

    console.log('=== UPLOAD SUCCESS ===')
    console.log('Upload results:', uploadResults)
    return {
      success: true,
      assets: uploadResults,
    }
  } catch (error: any) {
    console.error('=== TOP LEVEL UPLOAD ERROR ===')
    console.error('Error type:', typeof error)
    console.error('Error message:', error?.message || 'No message')
    console.error('Error stack:', error?.stack || 'No stack')
    console.error('Error name:', error?.name || 'No name')
    console.error('Error code:', error?.code || 'No code')
    console.error('Raw error object:', error)

    // Try to extract a meaningful error message
    let errorMessage = 'Upload failed'
    if (error?.message) {
      errorMessage = error.message
    } else if (error?.error) {
      errorMessage = error.error
    } else if (error?.statusText) {
      errorMessage = error.statusText
    } else if (typeof error === 'string') {
      errorMessage = error
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}