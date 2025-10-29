'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, Image, Video, Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Asset } from '@/types'

interface EventStats {
  event: string
  date: string
  totalAssets: number
  images: number
  videos: number
  photographer: string
}

export default function DashboardPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAssets()
  }, [])

  const loadAssets = async () => {
    try {
      const response = await fetch('/api/assets?pageSize=1000')
      if (!response.ok) {
        throw new Error('Failed to fetch assets')
      }
      const data = await response.json()
      setAssets(data.records)
    } catch (error) {
      console.error('Error loading assets:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Group assets by event
  const eventMap = new Map<string, EventStats>()
  assets.forEach(asset => {
    const key = asset.event
    if (!eventMap.has(key)) {
      eventMap.set(key, {
        event: asset.event,
        date: asset.date,
        totalAssets: 0,
        images: 0,
        videos: 0,
        photographer: asset.photographer || 'Unknown'
      })
    }
    const stats = eventMap.get(key)!
    stats.totalAssets++
    if (asset.fileType === 'image') stats.images++
    if (asset.fileType === 'video') stats.videos++
  })

  // Sort events by date (most recent first)
  const eventStats = Array.from(eventMap.values()).sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const totalImages = assets.filter(a => a.fileType === 'image').length
  const totalVideos = assets.filter(a => a.fileType === 'video').length

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Manage your speaker asset collection
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{assets.length}</div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Image className="h-4 w-4 mr-1" />
              {totalImages} photos
              <Video className="h-4 w-4 ml-3 mr-1" />
              {totalVideos} videos
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{eventStats.length}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Total events covered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Upload</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/upload">
              <Button className="w-full mt-2">
                <Upload className="mr-2 h-4 w-4" />
                Upload Assets
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Events by Date</CardTitle>
        </CardHeader>
        <CardContent>
          {eventStats.length > 0 ? (
            <div className="space-y-2">
              {eventStats.map((event) => (
                <Link
                  key={event.event}
                  href={`/gallery?event=${encodeURIComponent(event.event)}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer group">
                    <div className="flex items-start space-x-4 flex-1">
                      <Calendar className="h-5 w-5 text-blue-600 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{event.event}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatDate(event.date)}</span>
                          {event.photographer && (
                            <span className="truncate">📷 {event.photographer}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{event.totalAssets} assets</div>
                        <div className="flex items-center justify-end space-x-2 text-xs text-gray-500 mt-1">
                          {event.images > 0 && (
                            <span className="flex items-center">
                              <Image className="h-3 w-3 mr-1" />
                              {event.images}
                            </span>
                          )}
                          {event.videos > 0 && (
                            <span className="flex items-center">
                              <Video className="h-3 w-3 mr-1" />
                              {event.videos}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No events yet</p>
              <Link href="/upload">
                <Button>Upload Your First Assets</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}