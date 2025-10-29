'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface SearchFiltersProps {
  onSearch: (query: string) => void
  onFilter: (filters: FilterState) => void
  events: string[]
  photographers: string[]
  allTags: string[]
}

export interface FilterState {
  event?: string
  photographer?: string
  tags?: string[]
  dateFrom?: string
  dateTo?: string
  fileType?: 'image' | 'video'
}

export function SearchFilters({
  onSearch,
  onFilter,
  events,
  photographers,
  allTags
}: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({})

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  const addTag = (tag: string) => {
    const currentTags = filters.tags || []
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag]
      handleFilterChange('tags', newTags)
    }
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.filter(tag => tag !== tagToRemove)
    handleFilterChange('tags', newTags.length > 0 ? newTags : undefined)
  }

  const clearFilters = () => {
    setFilters({})
    onFilter({})
  }

  const hasActiveFilters = Object.values(filters).some(value =>
    value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true)
  )

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              !
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Event Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Event</label>
                <Select value={filters.event} onValueChange={(value) => handleFilterChange('event', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All events</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event} value={event}>
                        {event}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Photographer Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Photographer</label>
                <Select value={filters.photographer} onValueChange={(value) => handleFilterChange('photographer', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All photographers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All photographers</SelectItem>
                    {photographers.map((photographer) => (
                      <SelectItem key={photographer} value={photographer}>
                        {photographer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Type Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">File Type</label>
                <Select value={filters.fileType} onValueChange={(value) => handleFilterChange('fileType', value === 'all' ? undefined : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    placeholder="From"
                    value={filters.dateFrom || ''}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                  />
                  <Input
                    type="date"
                    placeholder="To"
                    value={filters.dateTo || ''}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                  />
                </div>
              </div>
            </div>

            {/* Tags Filter */}
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="space-y-2">
                <Select onValueChange={addTag}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add tag filter" />
                  </SelectTrigger>
                  <SelectContent>
                    {allTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {filters.tags && filters.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filters.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear All Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}