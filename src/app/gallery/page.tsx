'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Asset } from '@/types'
import { AssetGrid } from '@/components/gallery/asset-grid'
import { SearchFilters, FilterState } from '@/components/gallery/search-filters'
import { AssetDetailModal } from '@/components/gallery/asset-detail-modal'

export default function GalleryPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({})

  // Derived data for filters
  const events = [...new Set(assets.map(asset => asset.event))].sort()
  const photographers = [...new Set(assets.map(asset => asset.photographer))].sort()
  const allTags = [...new Set(assets.flatMap(asset => asset.tags))].sort()

  useEffect(() => {
    loadAssets()
  }, [])

  useEffect(() => {
    applyFiltersAndSearch()
  }, [assets, searchQuery, filters])

  const loadAssets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/assets?pageSize=1000')
      if (!response.ok) {
        throw new Error('Failed to fetch assets')
      }
      const result = await response.json()
      setAssets(result.records)
    } catch (error) {
      console.error('Error loading assets:', error)
      toast.error('Failed to load assets. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSearch = () => {
    let filtered = [...assets]

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(asset =>
        asset.originalFilename.toLowerCase().includes(query) ||
        asset.event.toLowerCase().includes(query) ||
        asset.photographer.toLowerCase().includes(query) ||
        asset.tags.some(tag => tag.toLowerCase().includes(query)) ||
        asset.description?.toLowerCase().includes(query)
      )
    }

    // Apply filters
    if (filters.event && filters.event !== 'all') {
      filtered = filtered.filter(asset => asset.event === filters.event)
    }

    if (filters.photographer && filters.photographer !== 'all') {
      filtered = filtered.filter(asset => asset.photographer === filters.photographer)
    }

    if (filters.fileType) {
      filtered = filtered.filter(asset => asset.fileType === filters.fileType)
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(asset =>
        filters.tags!.some(tag => asset.tags.includes(tag))
      )
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(asset => asset.date >= filters.dateFrom!)
    }

    if (filters.dateTo) {
      filtered = filtered.filter(asset => asset.date <= filters.dateTo!)
    }

    // Sort by event date in reverse chronological order (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA // Descending order
    })

    setFilteredAssets(filtered)
  }

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset)
  }

  const handleDownload = async (asset: Asset) => {
    try {
      toast.loading('Preparing download...', { id: 'download' })

      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: asset.filename }),
      })

      if (!response.ok) {
        throw new Error('Failed to get download URL')
      }

      const { downloadUrl } = await response.json()
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = asset.originalFilename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Download started!', { id: 'download', icon: '⬇️' })
    } catch (error) {
      console.error('Error downloading asset:', error)
      toast.error('Failed to download file', { id: 'download' })
    }
  }

  const handleShare = async (asset: Asset) => {
    try {
      await navigator.clipboard.writeText(asset.publicUrl)
      toast.success('Share link copied to clipboard!', {
        icon: '🔗',
      })
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast.error('Failed to copy link to clipboard')
      // Fallback: show the URL in an alert or modal
      alert(`Share this link: ${asset.publicUrl}`)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Asset Gallery</h1>
        <p className="text-gray-600">
          Browse and manage your speaking event photos and videos
        </p>
      </div>

      <SearchFilters
        onSearch={setSearchQuery}
        onFilter={setFilters}
        events={events}
        photographers={photographers}
        allTags={allTags}
      />

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredAssets.length} of {assets.length} assets
          </p>
        </div>

        <AssetGrid
          assets={filteredAssets}
          onAssetClick={handleAssetClick}
          onDownload={handleDownload}
          onShare={handleShare}
        />
      </div>

      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          isOpen={!!selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onDownload={handleDownload}
          onShare={handleShare}
        />
      )}
    </div>
  )
}