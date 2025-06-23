"use client"
import { useEffect, useState, useRef } from 'react'
import MangaCard from '@/components/MangaCard'
import ChapterPicker from '@/components/ChapterPicker'

interface Genre {
  id: string
  name: string
}

interface Manga {
  id: string
  title: string
  coverImage: string
  description: string
  mangaPlusUrl?: string
}

interface MangaDexTag {
  id: string
  type: string
  attributes: {
    name: {
      en: string
    }
  }
}

interface MangaDexRelationship {
  id: string
  type: string
  attributes?: {
    [key: string]: string | number | boolean
  }
}

interface MangaDexManga {
  id: string
  type: string
  attributes: {
    title: {
      en?: string
      [key: string]: string | undefined
    }
    description: {
      en?: string
      [key: string]: string | undefined
    }
    mangaPlusUrl?: string
  }
  relationships: MangaDexRelationship[]
}

const SELECTED_GENRES_KEY = 'manga-selected-genres';

export default function BrowsePage() {
  const [search, setSearch] = useState('')
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SELECTED_GENRES_KEY)
      if (stored) return JSON.parse(stored)
    }
    return []
  })
  const [mangaResults, setMangaResults] = useState<Manga[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pickerOpen, setPickerOpen] = useState<string | null>(null);

  // Fetch genres from our API route
  useEffect(() => {
    fetch('/api/manga/tags')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setGenres(data.data.map((g: MangaDexTag) => ({ id: g.id, name: g.attributes.name.en })))
        }
      })
      .catch((error) => {
        console.error('Error fetching genres:', error)
      })
  }, [])

  // Persist selected genres
  useEffect(() => {
    localStorage.setItem(SELECTED_GENRES_KEY, JSON.stringify(selectedGenres))
  }, [selectedGenres])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Fetch manga results using our API route
  useEffect(() => {
    setLoading(true)
    setError('')
    
    const params = new URLSearchParams()
    params.set('limit', '8')
    if (search) params.set('query', search)
    selectedGenres.forEach((id) => params.append('genre', id))
    
    // Add a small delay to debounce rapid changes
    const timeoutId = setTimeout(() => {
      fetch(`/api/manga?${params.toString()}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`)
          }
          return res.json()
        })
        .then(data => {
          if (data.error) {
            throw new Error(data.error)
          }
          
          if (data.data) {
            setMangaResults(
              data.data.map((m: MangaDexManga) => {
                const coverFile = m.relationships.find((r: MangaDexRelationship) => r.type === 'cover_art')?.attributes?.fileName
                return {
                  id: m.id,
                  title: m.attributes.title.en || Object.values(m.attributes.title)[0] || 'Untitled',
                  coverImage: coverFile
                    ? `https://uploads.mangadex.org/covers/${m.id}/${coverFile}.256.jpg`
                    : '',
                  description: m.attributes.description.en || '',
                  mangaPlusUrl: m.attributes.mangaPlusUrl
                }
              }).filter((m: Manga) => m.coverImage && m.title && m.description)
            )
          } else {
            setMangaResults([])
          }
          setLoading(false)
        })
        .catch((error) => {
          console.error('Fetch error:', error)
          setError('Failed to fetch manga. Please try again.')
          setLoading(false)
        })
    }, search ? 300 : 0) // Debounce search but load immediately for genre changes
    
    return () => clearTimeout(timeoutId)
  }, [search, selectedGenres])

  const handleGenreChange = (id: string) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
  }

  const handleRead = (mangaId: string) => {
    setPickerOpen(mangaId);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            Browse Manga
          </h1>
          <p className="text-xl text-gray-400">
            Discover your next favorite manga
          </p>
        </div>

        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto mb-12 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search manga by title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>

          {/* Genre Filter */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-white">Filter by Genres:</label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-3 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl text-white font-medium hover:bg-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex items-center justify-between min-w-[200px]"
                onClick={() => setDropdownOpen((open) => !open)}
              >
                <span>Select Genres</span>
                <svg className={`w-5 h-5 transition-transform duration-200 ${dropdownOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {dropdownOpen && (
                <div className="absolute z-20 mt-2 w-full sm:w-96 bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl p-4 max-h-80 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3">
                    {genres.map((genre) => (
                      <button
                        key={genre.id}
                        type="button"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                          selectedGenres.includes(genre.id)
                            ? 'bg-blue-600 text-white border border-blue-500 shadow-lg transform scale-105'
                            : 'bg-slate-700/50 text-gray-300 border border-slate-600 hover:bg-slate-600/50 hover:border-slate-500'
                        }`}
                        onClick={() => handleGenreChange(genre.id)}
                      >
                        {genre.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Selected Genres */}
            {selectedGenres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedGenres.map((id) => {
                  const genre = genres.find((g) => g.id === id)
                  if (!genre) return null
                  return (
                    <span key={id} className="flex items-center bg-blue-600/20 border border-blue-500/30 text-blue-300 font-medium px-4 py-2 rounded-full backdrop-blur-sm">
                      {genre.name}
                      <button
                        className="ml-2 text-blue-300 hover:text-red-400 font-bold focus:outline-none transition-colors"
                        onClick={() => handleGenreChange(id)}
                        aria-label={`Remove ${genre.name}`}
                        type="button"
                      >
                        ×
                      </button>
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-gray-400">Loading manga...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="text-red-400 text-lg mb-4">⚠️ {error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : mangaResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mangaResults.map((manga) => (
                <div key={manga.id} className="group relative">
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:transform hover:scale-105">
                    <MangaCard
                      id={manga.id}
                      title={manga.title}
                      coverImage={manga.coverImage}
                      description={manga.description}
                    />
                    <div className="p-4">
                      {manga.mangaPlusUrl ? (
                        <a
                          href={manga.mangaPlusUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 text-center block"
                        >
                          Read on MangaPlus
                        </a>
                      ) : (
                        <button
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105"
                          onClick={() => handleRead(manga.id)}
                        >
                          Start Reading
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-400 text-lg">No manga found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or genre filters</p>
            </div>
          )}
        </div>
      </div>

      {pickerOpen && (
        <ChapterPicker
          mangaId={pickerOpen}
          mangaPlusUrl={
            mangaResults.find((m) => m.id === pickerOpen)?.mangaPlusUrl
          }
          onClose={() => setPickerOpen(null)}
        />
      )}
    </main>
  )
} 