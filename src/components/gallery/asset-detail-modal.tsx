'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Download, Calendar, User, Tag, FileText, X, Play, Share2, Eye } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Asset } from '@/types'

interface AssetDetailModalProps {
  asset: Asset
  isOpen: boolean
  onClose: () => void
  onDownload: (asset: Asset) => void
  onShare?: (asset: Asset) => void
}

export function AssetDetailModal({
  asset,
  isOpen,
  onClose,
  onDownload,
  onShare
}: AssetDetailModalProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loadingVideo, setLoadingVideo] = useState(false)
  const [loadingImage, setLoadingImage] = useState(false)

  // Detect if file is actually a video based on URL extension
  const isVideoFile = (asset: Asset): boolean => {
    if (asset.fileType === 'video') return true
    const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv', '.m4v']
    return videoExtensions.some(ext => asset.publicUrl?.toLowerCase().endsWith(ext))
  }

  // Fetch direct download URL for videos when modal opens
  useEffect(() => {
    if (isOpen && isVideoFile(asset) && asset.boxFileId) {
      setLoadingVideo(true)
      setVideoUrl(null)

      fetch(`/api/box-download/${asset.boxFileId}`)
        .then(res => res.json())
        .then(data => {
          if (data.url) {
            setVideoUrl(data.url)
          }
        })
        .catch(err => {
          console.error('Failed to get video URL:', err)
        })
        .finally(() => {
          setLoadingVideo(false)
        })
    }
  }, [isOpen, asset.boxFileId, asset.fileType])

  // Fetch direct download URL for images when modal opens
  useEffect(() => {
    if (isOpen && !isVideoFile(asset) && asset.boxFileId) {
      setLoadingImage(true)
      setImageUrl(null)

      fetch(`/api/box-download/${asset.boxFileId}`)
        .then(res => res.json())
        .then(data => {
          if (data.url) {
            setImageUrl(data.url)
          }
        })
        .catch(err => {
          console.error('Failed to get image URL:', err)
        })
        .finally(() => {
          setLoadingImage(false)
        })
    } else if (isOpen && !isVideoFile(asset) && !asset.boxFileId) {
      // Use publicUrl for assets without boxFileId
      setImageUrl(asset.publicUrl)
    }
  }, [isOpen, asset.boxFileId, asset.fileType, asset.publicUrl])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatUploadDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="truncate pr-4">
            {asset.event} - {asset.photographer}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Preview */}
          <div className="space-y-4">
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {isVideoFile(asset) ? (
                loadingVideo ? (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <Play className="h-16 w-16 text-white opacity-70 mx-auto mb-4 animate-pulse" />
                      <p className="text-white">Loading video...</p>
                    </div>
                  </div>
                ) : videoUrl ? (
                  <video
                    key={videoUrl}
                    src={videoUrl}
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                    playsInline
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <div className="text-center">
                      <Play className="h-16 w-16 text-white opacity-70 mx-auto mb-4" />
                      <p className="text-white">Unable to load video</p>
                      <p className="text-gray-400 text-sm mt-2">Try downloading the file</p>
                    </div>
                  </div>
                )
              ) : !isVideoFile(asset) ? (
                loadingImage ? (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-2 animate-pulse">🖼️</div>
                      <p className="text-gray-600">Loading image...</p>
                    </div>
                  </div>
                ) : imageUrl ? (
                  imageUrl.includes('box.com') ? (
                    <img
                      src={imageUrl}
                      alt={asset.originalFilename}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Image
                      src={imageUrl}
                      alt={asset.originalFilename}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  )
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🖼️</div>
                      <p className="text-gray-600">Unable to load image</p>
                      <p className="text-gray-400 text-sm mt-2">Try downloading the file</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-16 w-16 text-white opacity-70 mx-auto mb-4" />
                    <p className="text-white">Preview not available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Technical Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">File Size:</span>
                <p className="font-medium">{formatFileSize(asset.size)}</p>
              </div>
              <div>
                <span className="text-gray-500">File Type:</span>
                <p className="font-medium capitalize">{asset.fileType}</p>
              </div>
              {asset.width && asset.height && (
                <>
                  <div>
                    <span className="text-gray-500">Dimensions:</span>
                    <p className="font-medium">{asset.width} × {asset.height}px</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Aspect Ratio:</span>
                    <p className="font-medium">
                      {(asset.width / asset.height).toFixed(2)}:1
                    </p>
                  </div>
                </>
              )}
              {asset.duration && (
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <p className="font-medium">{asset.duration}s</p>
                </div>
              )}
            </div>
          </div>

          {/* Asset Metadata */}
          <div className="space-y-6">
            {/* Event Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Event Details</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">{asset.event}</p>
                    <p className="text-sm text-gray-500">{formatDate(asset.date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Photographer</p>
                    <p className="font-medium">{asset.photographer}</p>
                  </div>
                </div>

                {asset.description && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-sm">{asset.description}</p>
                    </div>
                  </div>
                )}

                {asset.tags.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {asset.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Information */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-lg mb-3">Upload Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Uploaded:</span>
                  <p className="font-medium">{formatUploadDate(asset.uploadedAt)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Original Filename:</span>
                  <p className="font-medium break-all">{asset.originalFilename}</p>
                </div>
                <div>
                  <span className="text-gray-500">MIME Type:</span>
                  <p className="font-medium">{asset.mimeType}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => onDownload(asset)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Original File
                </Button>

                <Button
                  variant="outline"
                  onClick={() => onShare?.(asset)}
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                  size="lg"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Share Link
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                  size="lg"
                  onClick={() => window.open(asset.publicUrl, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {isVideoFile(asset) ? 'Open Video in New Tab' : 'Open Full Size'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}