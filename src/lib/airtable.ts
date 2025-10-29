import Airtable from 'airtable'
import { Asset, AssetMetadata, StatsData } from '@/types'

const getBase = () => {
  if (!process.env.AIRTABLE_ACCESS_TOKEN) {
    throw new Error('AIRTABLE_ACCESS_TOKEN is not defined')
  }
  return new Airtable({ apiKey: process.env.AIRTABLE_ACCESS_TOKEN }).base(
    process.env.AIRTABLE_BASE_ID!
  )
}

const getTable = () => getBase()(process.env.AIRTABLE_TABLE_NAME!)

export async function createAssetRecord(asset: Omit<Asset, 'id'>): Promise<Asset> {
  const recordData: any = {
    filename: asset.filename,
    originalFilename: asset.originalFilename,
    url: asset.url,
    fileType: asset.fileType,
    mimeType: asset.mimeType,
    size: asset.size,
    event: asset.event,
    date: asset.date,
    photographer: asset.photographer,
    description: asset.description,
    uploadedAt: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
  }

  // Optional fields
  if (asset.width) recordData.width = asset.width
  if (asset.height) recordData.height = asset.height
  if (asset.duration) recordData.duration = asset.duration

  // Only add tags if they exist and are not empty
  if (asset.tags && asset.tags.length > 0) {
    recordData.tags = asset.tags // Send as array for Multiple Select field
  }

  console.log('Creating Airtable record with data:', recordData)

  const record = await getTable().create(recordData)

  return {
    id: record.id,
    filename: record.get('filename') as string,
    originalFilename: record.get('originalFilename') as string,
    url: record.get('url') as string,
    publicUrl: record.get('url') as string, // Use url as publicUrl for compatibility
    fileType: record.get('fileType') as 'image' | 'video',
    mimeType: record.get('mimeType') as string,
    size: record.get('size') as number,
    width: record.get('width') as number | undefined,
    height: record.get('height') as number | undefined,
    duration: record.get('duration') as number | undefined,
    uploadedAt: record.get('uploadedAt') as string,
    event: record.get('event') as string,
    date: record.get('date') as string,
    photographer: record.get('photographer') as string,
    tags: Array.isArray(record.get('tags')) ? record.get('tags') as string[] : [],
    description: record.get('description') as string | undefined,
  }
}

export async function getAssets(
  pageSize: number = 1000,
  offset?: string
): Promise<{ records: Asset[]; offset?: string }> {
  const selectOptions: any = {
    maxRecords: pageSize,
    sort: [{ field: 'uploadedAt', direction: 'desc' }],
  }

  if (offset) {
    selectOptions.offset = offset
  }

  // Use .all() to fetch all records across multiple pages
  const records = await getTable()
    .select(selectOptions)
    .all()

  const assets: Asset[] = records.map((record) => ({
    id: record.id,
    filename: record.get('filename') as string,
    originalFilename: record.get('originalFilename') as string || record.get('filename') as string,
    url: record.get('url') as string,
    publicUrl: record.get('url') as string,
    fileType: (record.get('fileType') as 'image' | 'video') || 'image',
    mimeType: (record.get('mimeType') as string) || 'image/png',
    size: (record.get('size') as number) || 0,
    width: record.get('width') as number | undefined,
    height: record.get('height') as number | undefined,
    duration: record.get('duration') as number | undefined,
    uploadedAt: record.get('uploadedAt') as string,
    event: record.get('event') as string,
    date: record.get('date') as string,
    photographer: record.get('photographer') as string,
    tags: Array.isArray(record.get('tags')) ? record.get('tags') as string[] : [],
    description: record.get('description') as string | undefined,
  }))

  return {
    records: assets,
    offset: records.length === pageSize ? records[records.length - 1].id : undefined,
  }
}

export async function searchAssets(query: {
  event?: string
  photographer?: string
  tags?: string[]
  dateFrom?: string
  dateTo?: string
}): Promise<Asset[]> {
  let filterFormula = ''
  const conditions: string[] = []

  if (query.event) {
    conditions.push(`FIND("${query.event}", {event}) > 0`)
  }

  if (query.photographer) {
    conditions.push(`FIND("${query.photographer}", {photographer}) > 0`)
  }

  if (query.tags && query.tags.length > 0) {
    const tagConditions = query.tags.map(tag => `FIND("${tag}", {tags}) > 0`)
    conditions.push(`OR(${tagConditions.join(', ')})`)
  }

  if (query.dateFrom) {
    conditions.push(`IS_AFTER({date}, "${query.dateFrom}")`)
  }

  if (query.dateTo) {
    conditions.push(`IS_BEFORE({date}, "${query.dateTo}")`)
  }

  if (conditions.length > 0) {
    filterFormula = `AND(${conditions.join(', ')})`
  }

  const records = await getTable()
    .select({
      filterByFormula: filterFormula,
      sort: [{ field: 'uploadedAt', direction: 'desc' }],
    })
    .all()

  return records.map((record) => ({
    id: record.id,
    filename: record.get('filename') as string,
    originalFilename: record.get('originalFilename') as string,
    url: record.get('url') as string,
    publicUrl: record.get('url') as string, // Use url as publicUrl for compatibility
    fileType: record.get('fileType') as 'image' | 'video',
    mimeType: record.get('mimeType') as string,
    size: record.get('size') as number,
    width: record.get('width') as number | undefined,
    height: record.get('height') as number | undefined,
    duration: record.get('duration') as number | undefined,
    uploadedAt: record.get('uploadedAt') as string,
    event: record.get('event') as string,
    date: record.get('date') as string,
    photographer: record.get('photographer') as string,
    tags: Array.isArray(record.get('tags')) ? record.get('tags') as string[] : [],
    description: record.get('description') as string | undefined,
  }))
}

export async function getAssetById(id: string): Promise<Asset | null> {
  try {
    const record = await getTable().find(id)

    return {
      id: record.id,
      filename: record.get('filename') as string,
      originalFilename: record.get('originalFilename') as string,
      url: record.get('url') as string,
      publicUrl: record.get('url') as string, // Use url as publicUrl for compatibility
      fileType: record.get('fileType') as 'image' | 'video',
      mimeType: record.get('mimeType') as string,
      size: record.get('size') as number,
      width: record.get('width') as number | undefined,
      height: record.get('height') as number | undefined,
      duration: record.get('duration') as number | undefined,
      uploadedAt: record.get('uploadedAt') as string,
      event: record.get('event') as string,
      date: record.get('date') as string,
      photographer: record.get('photographer') as string,
      tags: Array.isArray(record.get('tags')) ? record.get('tags') as string[] : [],
      description: record.get('description') as string | undefined,
    }
  } catch (error) {
    console.error('Error fetching asset:', error)
    return null
  }
}

export async function getStats(): Promise<StatsData> {
  const records = await getTable().select().all()

  const totalAssets = records.length
  const events = new Set(records.map(record => record.get('event') as string))
  const totalEvents = events.size

  const photographerCounts = new Map<string, number>()
  records.forEach(record => {
    const photographer = record.get('photographer') as string
    photographerCounts.set(photographer, (photographerCounts.get(photographer) || 0) + 1)
  })

  const topPhotographers = Array.from(photographerCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const recentUploads = Array.from(records)
    .sort((a: any, b: any) =>
      new Date(b.get('uploadedAt') as string).getTime() -
      new Date(a.get('uploadedAt') as string).getTime()
    )
    .slice(0, 5)
    .map((record: any) => ({
      id: record.id,
      filename: record.get('filename') as string,
      originalFilename: record.get('originalFilename') as string,
      url: record.get('url') as string,
      publicUrl: record.get('url') as string, // Use url as publicUrl for compatibility
      fileType: record.get('fileType') as 'image' | 'video',
      mimeType: record.get('mimeType') as string,
      size: record.get('size') as number,
      width: record.get('width') as number | undefined,
      height: record.get('height') as number | undefined,
      duration: record.get('duration') as number | undefined,
      uploadedAt: record.get('uploadedAt') as string,
      event: record.get('event') as string,
      date: record.get('date') as string,
      photographer: record.get('photographer') as string,
      tags: Array.isArray(record.get('tags')) ? record.get('tags') as string[] : [],
      description: record.get('description') as string | undefined,
    }))

  return {
    totalAssets,
    totalEvents,
    topPhotographers,
    recentUploads,
  }
}

export async function deleteAsset(id: string): Promise<void> {
  await getTable().destroy(id)
}