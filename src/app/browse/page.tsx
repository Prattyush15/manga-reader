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
    params.set('limit', '18')
    if (search) params.set('query', search)
    selectedGenres.forEach((id) => params.append('genre', id))
    
    fetch(`/api/manga?${params.toString()}`)
      .then(res => res.json())
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
            })
          )
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error('Fetch error:', error)
        setError('Failed to fetch manga. Please try again.')
        setLoading(false)
      })
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
    <main className="min-h-screen bg-black text-white flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Manga</h1>
      <div className="w-full max-w-3xl flex flex-col gap-6 mb-8">
        <input
          type="text"
          placeholder="Search manga..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded bg-[#182820] border border-green-600 text-green focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <div>
          <label className="block mb-2 text-green font-semibold">Genres:</label>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="px-4 py-2 rounded bg-green-700 text-white font-bold border border-green-600 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              Select Genres
            </button>
            {dropdownOpen && (
              <div className="absolute z-20 mt-2 bg-[#101a14] border border-green-700 rounded shadow-lg p-4 flex flex-wrap gap-2 max-h-72 overflow-y-auto min-w-[250px]">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    type="button"
                    className={`px-3 py-1 rounded-full text-sm font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-400
                      ${selectedGenres.includes(genre.id)
                        ? 'bg-yellow-400 text-black border-2 border-yellow-700 scale-105'
                        : 'bg-[#232d23] text-green-400 border border-green-700 hover:bg-green-700/30 hover:scale-105'}
                    `}
                    style={{ transition: 'all 0.15s' }}
                    onClick={() => handleGenreChange(genre.id)}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Selected genres as chips */}
          {selectedGenres.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedGenres.map((id) => {
                const genre = genres.find((g) => g.id === id)
                if (!genre) return null
                return (
                  <span key={id} className="flex items-center bg-yellow-400 text-black font-bold px-3 py-1 rounded-full border-2 border-yellow-700">
                    {genre.name}
                    <button
                      className="ml-2 text-black hover:text-red-600 font-bold focus:outline-none"
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
      {loading && <div className="text-green text-lg">Loading manga...</div>}
      {error && <div className="text-red-400 text-lg">{error}</div>}
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {mangaResults.map((manga) => (
          <div key={manga.id} className="relative">
            <MangaCard
              id={manga.id}
              title={manga.title}
              coverImage={manga.coverImage}
              description={manga.description}
            />
            {manga.mangaPlusUrl ? (
              <a
                href={manga.mangaPlusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 bg-pink-600 text-white px-4 py-2 rounded shadow hover:bg-pink-700 font-bold text-center"
              >
                Read on MangaPlus
              </a>
            ) : (
              <button
                className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                onClick={() => handleRead(manga.id)}
              >
                Read
              </button>
            )}
          </div>
        ))}
      </div>
      {!loading && mangaResults.length === 0 && (
        <div className="text-green text-lg mt-8">No manga found. Try a different search or genre.</div>
      )}
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