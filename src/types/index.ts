export interface Asset {
  id: string
  filename: string
  originalFilename: string
  boxFileId?: string
  url: string
  publicUrl: string
  fileType: 'image' | 'video'
  mimeType: string
  size: number
  width?: number
  height?: number
  duration?: number
  uploadedAt: string
  event: string
  date: string
  location?: string
  photographer: string
  tags: string[]
  description?: string
}

export interface UploadProgress {
  filename: string
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

export interface AssetMetadata {
  event: string
  date: string
  location?: string
  photographer: string
  tags: string[]
  description?: string
}

export interface BatchUploadData {
  files: File[]
  metadata: AssetMetadata
}

export interface StatsData {
  totalAssets: number
  totalEvents: number
  topPhotographers: { name: string; count: number }[]
  recentUploads: Asset[]
}