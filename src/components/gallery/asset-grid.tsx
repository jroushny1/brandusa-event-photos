'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Play, Download, Eye, Share2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Asset } from '@/types'
import { cn } from '@/lib/utils'

interface AssetGridProps {
  assets: Asset[]
  onAssetClick?: (asset: Asset) => void
  onDownload?: (asset: Asset) => void
  onShare?: (asset: Asset) => void
}

export function AssetGrid({ assets, onAssetClick, onDownload, onShare }: AssetGridProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [videoErrors, setVideoErrors] = useState<Set<string>>(new Set())
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map())

  const handleImageError = (assetId: string) => {
    setImageErrors(prev => new Set(prev).add(assetId))
  }

  const handleVideoError = (assetId: string) => {
    setVideoErrors(prev => new Set(prev).add(assetId))
  }

  // Fetch direct download URLs for images with Box file IDs
  useEffect(() => {
    assets.forEach(asset => {
      if (asset.fileType === 'image' && asset.boxFileId && !imageUrls.has(asset.id)) {
        fetch(`/api/box-download/${asset.boxFileId}`)
          .then(res => res.json())
          .then(data => {
            if (data.url) {
              setImageUrls(prev => new Map(prev).set(asset.id, data.url))
            }
          })
          .catch(err => {
            console.error('Failed to get image URL:', err)
          })
      }
    })
  }, [assets])

  // Detect if file is actually a video based on URL extension
  const isVideoFile = (asset: Asset): boolean => {
    if (asset.fileType === 'video') return true
    const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv', '.m4v']
    return videoExtensions.some(ext => asset.publicUrl?.toLowerCase().endsWith(ext))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No assets found</p>
        <p className="text-gray-400 text-sm mt-2">
          Upload some photos and videos to get started
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {assets.map((asset) => (
        <Card
          key={asset.id}
          className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onAssetClick?.(asset)}
        >
          <div className="relative aspect-square bg-gray-100">
            {isVideoFile(asset) && asset.publicUrl ? (
              videoErrors.has(asset.id) ? (
                // Show placeholder if video thumbnail fails to load
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-16 w-16 text-white opacity-60 mx-auto mb-2" />
                    <div className="text-white text-sm opacity-80">Video</div>
                    <div className="text-xs text-gray-400 px-4 mt-1 truncate max-w-[200px]">
                      {asset.originalFilename}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={`${asset.publicUrl}#t=0.1`}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                    playsInline
                    onError={() => {
                      console.log('Video thumbnail failed to load, showing placeholder')
                      handleVideoError(asset.id)
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center pointer-events-none">
                    <Play className="h-12 w-12 text-white opacity-90" />
                  </div>
                </div>
              )
            ) : !isVideoFile(asset) &&
              !imageErrors.has(asset.id) ? (
              // Use direct download URL from Box if available, otherwise fallback to publicUrl
              (() => {
                const imageUrl = imageUrls.get(asset.id) || asset.publicUrl

                if (!imageUrl || imageUrl.trim() === '') {
                  return (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🖼️</div>
                        <div className="text-xs text-gray-500 px-2 truncate">
                          Loading...
                        </div>
                      </div>
                    </div>
                  )
                }

                // Use regular img tag for Box images
                if (imageUrl.includes('box.com')) {
                  return (
                    <img
                      src={imageUrl}
                      alt={asset.originalFilename || 'Uploaded image'}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(asset.id)}
                    />
                  )
                }

                // Use Next.js Image for other sources
                return (
                  <Image
                    src={imageUrl}
                    alt={asset.originalFilename || 'Uploaded image'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    onError={() => handleImageError(asset.id)}
                  />
                )
              })()
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-2">📄</div>
                  <div className="text-xs text-gray-500 px-2 truncate">
                    {asset.originalFilename}
                  </div>
                </div>
              </div>
            )}

            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAssetClick?.(asset)
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    onShare?.(asset)
                  }}
                  title="Share Link"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDownload?.(asset)
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* File type indicator */}
            <div className="absolute top-2 right-2">
              {isVideoFile(asset) && (
                <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center">
                  <Play className="h-3 w-3 mr-1" />
                  Video
                </div>
              )}
            </div>
          </div>

          {/* Asset info */}
          <div className="p-3">
            <h3 className="font-medium text-sm truncate mb-1" title={`${asset.event} - ${asset.photographer}`}>
              {asset.event}
            </h3>
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span className="truncate">{asset.photographer}</span>
                <span>{formatFileSize(asset.size)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{formatDate(asset.date)}</span>
                <span className="capitalize">{asset.fileType}</span>
              </div>
              {asset.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {asset.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {asset.tags.length > 2 && (
                    <span className="text-gray-400 text-xs">
                      +{asset.tags.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}