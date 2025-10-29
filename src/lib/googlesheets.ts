import { google } from 'googleapis'
import { Asset, AssetMetadata, StatsData } from '@/types'

// Initialize Google Sheets API
const getSheets = () => {
  // Handle the private key - it might come with literal \n or actual newlines
  let privateKey = process.env.GOOGLE_PRIVATE_KEY!

  // Debug: Check what we're receiving (only in development/Vercel logs)
  if (process.env.NODE_ENV !== 'production') {
    console.log('Private key length:', privateKey.length)
    console.log('Private key starts with:', privateKey.substring(0, 50))
    console.log('Has literal backslash-n:', privateKey.includes('\\n'))
    console.log('Has actual newlines:', privateKey.includes('\n'))
  }

  // If it has literal \n, convert them to actual newlines
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n')
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  return google.sheets({ version: 'v4', auth })
}

const SHEET_NAME = 'Assets' // Sheet tab name
const HEADER_ROW = [
  'ID',
  'Filename',
  'Original Filename',
  'Box File ID',
  'URL',
  'File Type',
  'MIME Type',
  'Size',
  'Width',
  'Height',
  'Duration',
  'Uploaded At',
  'Event',
  'Date',
  'Location',
  'Photographer',
  'Tags',
  'Description',
]

/**
 * Initialize the Google Sheet with headers if it doesn't exist
 */
export async function initializeSheet(): Promise<void> {
  const sheets = getSheets()
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!

  try {
    // Check if sheet exists
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    })

    const sheet = response.data.sheets?.find((s) => s.properties?.title === SHEET_NAME)

    if (!sheet) {
      // Create the sheet if it doesn't exist
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: SHEET_NAME,
                },
              },
            },
          ],
        },
      })
    }

    // Check if headers exist
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A1:R1`,
    })

    if (!headerResponse.data.values || headerResponse.data.values.length === 0) {
      // Add headers if they don't exist
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEET_NAME}!A1:R1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [HEADER_ROW],
        },
      })
    }
  } catch (error) {
    console.error('Error initializing sheet:', error)
    throw new Error(`Failed to initialize Google Sheet: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Convert Asset object to sheet row array
 */
function assetToRow(asset: Asset): any[] {
  return [
    asset.id,
    asset.filename,
    asset.originalFilename,
    asset.boxFileId || '',
    asset.url,
    asset.fileType,
    asset.mimeType,
    asset.size,
    asset.width || '',
    asset.height || '',
    asset.duration || '',
    asset.uploadedAt,
    asset.event,
    asset.date,
    asset.location || '',
    asset.photographer,
    Array.isArray(asset.tags) ? asset.tags.join(', ') : '',
    asset.description || '',
  ]
}

/**
 * Convert sheet row array to Asset object
 * Handles both old format (without boxFileId) and new format (with boxFileId)
 */
function rowToAsset(row: any[], rowIndex: number): Asset {
  // Check if this is old format (URL in position 3 will start with http)
  // or new format (boxFileId in position 3 will be a number)
  const isOldFormat = row[3] && (row[3].startsWith('http') || row[3].startsWith('https'))

  if (isOldFormat) {
    // Old format: no boxFileId column
    return {
      id: row[0] || `row-${rowIndex}`,
      filename: row[1] || '',
      originalFilename: row[2] || row[1] || '',
      boxFileId: undefined, // Extract from URL if possible
      url: row[3] || '',
      publicUrl: row[3] || '',
      fileType: (row[4] as 'image' | 'video') || 'image',
      mimeType: row[5] || 'image/png',
      size: parseInt(row[6]) || 0,
      width: row[7] ? parseInt(row[7]) : undefined,
      height: row[8] ? parseInt(row[8]) : undefined,
      duration: row[9] ? parseFloat(row[9]) : undefined,
      uploadedAt: row[10] || new Date().toISOString().split('T')[0],
      event: row[11] || '',
      date: row[12] || '',
      location: row[13] || undefined,
      photographer: row[14] || '',
      tags: row[15] ? row[15].split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      description: row[16] || undefined,
    }
  } else {
    // New format: with boxFileId column
    return {
      id: row[0] || `row-${rowIndex}`,
      filename: row[1] || '',
      originalFilename: row[2] || row[1] || '',
      boxFileId: row[3] || undefined,
      url: row[4] || '',
      publicUrl: row[4] || '',
      fileType: (row[5] as 'image' | 'video') || 'image',
      mimeType: row[6] || 'image/png',
      size: parseInt(row[7]) || 0,
      width: row[8] ? parseInt(row[8]) : undefined,
      height: row[9] ? parseInt(row[9]) : undefined,
      duration: row[10] ? parseFloat(row[10]) : undefined,
      uploadedAt: row[11] || new Date().toISOString().split('T')[0],
      event: row[12] || '',
      date: row[13] || '',
      location: row[14] || undefined,
      photographer: row[15] || '',
      tags: row[16] ? row[16].split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      description: row[17] || undefined,
    }
  }
}

/**
 * Create a new asset record in Google Sheets
 */
export async function createAssetRecord(asset: Omit<Asset, 'id'>): Promise<Asset> {
  await initializeSheet()
  const sheets = getSheets()
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!

  // Generate a unique ID
  const id = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

  const newAsset: Asset = {
    ...asset,
    id,
    uploadedAt: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
  }

  const row = assetToRow(newAsset)

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:R`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    })

    return newAsset
  } catch (error) {
    console.error('Error creating asset record:', error)
    throw new Error(`Failed to create asset record: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get all assets from Google Sheets
 */
export async function getAssets(
  pageSize: number = 1000,
  offset?: string
): Promise<{ records: Asset[]; offset?: string }> {
  await initializeSheet()
  const sheets = getSheets()
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A2:R`, // Skip header row
    })

    const rows = response.data.values || []
    const assets = rows
      .map((row, index) => rowToAsset(row, index + 2))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    // Apply pagination if needed
    const startIndex = offset ? parseInt(offset) : 0
    const paginatedAssets = assets.slice(startIndex, startIndex + pageSize)
    const nextOffset = startIndex + pageSize < assets.length ? String(startIndex + pageSize) : undefined

    return {
      records: paginatedAssets,
      offset: nextOffset,
    }
  } catch (error) {
    console.error('Error getting assets:', error)
    throw new Error(`Failed to get assets: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Search for assets by various criteria
 */
export async function searchAssets(query: {
  event?: string
  photographer?: string
  location?: string
  tags?: string[]
  dateFrom?: string
  dateTo?: string
}): Promise<Asset[]> {
  const { records } = await getAssets(10000) // Get all records for search

  return records.filter((asset) => {
    // Filter by event
    if (query.event && !asset.event.toLowerCase().includes(query.event.toLowerCase())) {
      return false
    }

    // Filter by photographer
    if (query.photographer && !asset.photographer.toLowerCase().includes(query.photographer.toLowerCase())) {
      return false
    }

    // Filter by location
    if (query.location && asset.location && !asset.location.toLowerCase().includes(query.location.toLowerCase())) {
      return false
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      const hasMatchingTag = query.tags.some((tag) =>
        asset.tags.some((assetTag) => assetTag.toLowerCase().includes(tag.toLowerCase()))
      )
      if (!hasMatchingTag) {
        return false
      }
    }

    // Filter by date range
    if (query.dateFrom && asset.date < query.dateFrom) {
      return false
    }

    if (query.dateTo && asset.date > query.dateTo) {
      return false
    }

    return true
  })
}

/**
 * Get a single asset by ID
 */
export async function getAssetById(id: string): Promise<Asset | null> {
  const { records } = await getAssets(10000)
  return records.find((asset) => asset.id === id) || null
}

/**
 * Get statistics for the dashboard
 */
export async function getStats(): Promise<StatsData> {
  const { records } = await getAssets(10000)

  const totalAssets = records.length
  const events = new Set(records.map((record) => record.event))
  const totalEvents = events.size

  const photographerCounts = new Map<string, number>()
  records.forEach((record) => {
    const photographer = record.photographer
    photographerCounts.set(photographer, (photographerCounts.get(photographer) || 0) + 1)
  })

  const topPhotographers = Array.from(photographerCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const recentUploads = records
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 5)

  return {
    totalAssets,
    totalEvents,
    topPhotographers,
    recentUploads,
  }
}

/**
 * Delete an asset by ID
 */
export async function deleteAsset(id: string): Promise<void> {
  await initializeSheet()
  const sheets = getSheets()
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!

  try {
    // Get all rows to find the one to delete
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A2:A`, // Get all IDs
    })

    const rows = response.data.values || []
    const rowIndex = rows.findIndex((row) => row[0] === id)

    if (rowIndex === -1) {
      throw new Error(`Asset with ID ${id} not found`)
    }

    // Delete the row (add 2 because we skip header and arrays are 0-indexed)
    const actualRowIndex = rowIndex + 2

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, // Assumes first sheet
                dimension: 'ROWS',
                startIndex: actualRowIndex - 1,
                endIndex: actualRowIndex,
              },
            },
          },
        ],
      },
    })
  } catch (error) {
    console.error('Error deleting asset:', error)
    throw new Error(`Failed to delete asset: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Test Google Sheets connection
 */
export async function testGoogleSheetsConnection(): Promise<string> {
  const sheets = getSheets()
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!

  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    })

    return `Connected to Google Sheets successfully. Spreadsheet: ${response.data.properties?.title}`
  } catch (error) {
    console.error('Google Sheets connection test failed:', error)
    throw new Error(
      `Google Sheets connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
