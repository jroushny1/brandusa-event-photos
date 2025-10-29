'use client'

import { useCallback, useState, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, File, Image, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface FileWithPreview extends File {
  preview?: string
}

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void
  maxSize?: number
  acceptedFileTypes?: Record<string, string[]>
  multiple?: boolean
  className?: string
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024 * 1024 // 5GB
const DEFAULT_ACCEPTED_TYPES = {
  'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
  'video/*': ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm'],
}

export function UploadDropzone({
  onFilesSelected,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedFileTypes = DEFAULT_ACCEPTED_TYPES,
  multiple = true,
  className,
}: UploadDropzoneProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragActive, setIsDragActive] = useState(false)
  const prevFilesRef = useRef<FileWithPreview[]>([])

  // Notify parent component when files change
  useEffect(() => {
    if (files !== prevFilesRef.current) {
      onFilesSelected(files)
      prevFilesRef.current = files
    }
  }, [files, onFilesSelected])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const filesWithPreview = acceptedFiles.map((file) => {
        const fileWithPreview = Object.assign(file, {
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        })
        return fileWithPreview
      })

      setFiles((prev) => [...prev, ...filesWithPreview])
    },
    []
  )

  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize,
    multiple,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  })

  const removeFile = (fileToRemove: FileWithPreview) => {
    setFiles((prev) => prev.filter((file) => file !== fileToRemove))

    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Card
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragAccept && 'border-green-500 bg-green-50',
          isDragReject && 'border-red-500 bg-red-50',
          isDragActive && !isDragAccept && !isDragReject && 'border-blue-500 bg-blue-50',
          !isDragActive && 'border-gray-300 hover:border-gray-400'
        )}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isDragActive ? 'Drop files here' : 'Upload your assets'}
          </h3>
          <p className="text-gray-500 mb-4">
            Drag & drop photos and videos, or click to browse
          </p>
          <p className="text-sm text-gray-400">
            Supports images and videos up to {formatFileSize(maxSize)}
          </p>
          <Button type="button" variant="default" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
            Choose Files
          </Button>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Selected Files ({files.length})</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <Card key={`${file.name}-${index}`} className="p-3">
                <div className="flex items-center space-x-3">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}