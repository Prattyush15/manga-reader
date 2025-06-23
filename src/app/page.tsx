"use client"
import { useEffect, useState } from 'react'
import MangaCard from '@/components/MangaCard'
import ChapterPicker from '@/components/ChapterPicker'

interface Manga {
  id: string
  title: string
  coverImage: string
  description: string
  mangaPlusUrl?: string
}

interface MangaDexRelationship {
  id: string
  type: string
  attributes?: {
    fileName?: string
  }
}

interface MangaDexManga {
  id: string
  attributes: {
    title: { en?: string, [key: string]: string | undefined }
    description: { en?: string }
    links?: { mangaplus?: string }
  }
  relationships: MangaDexRelationship[]
}

export default function Home() {
  const [mangaList, setMangaList] = useState<Manga[]>([])
  const [loading, setLoading] = useState(true)
  const [pickerOpen, setPickerOpen] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    
    // Fetch featured manga
    fetch('/api/manga/featured')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          const processedManga = data.data.map((m: MangaDexManga) => {
            const coverFile = m.relationships.find((r: MangaDexRelationship) => r.type === 'cover_art')?.attributes?.fileName
            const mangaPlusUrl = m.attributes.links?.mangaplus ? `https://mangaplus.shueisha.co.jp/titles/${m.attributes.links.mangaplus}` : undefined
            return {
              id: m.id,
              title: m.attributes.title.en || Object.values(m.attributes.title)[0] || 'Untitled',
              coverImage: coverFile
                ? `https://uploads.mangadex.org/covers/${m.id}/${coverFile}.256.jpg`
                : '',
              description: m.attributes.description.en || '',
              mangaPlusUrl,
            }
          }).filter((m: Manga) => m.coverImage && m.title && m.description)
          
          setMangaList(processedManga)
        }
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching featured manga:', error)
        setLoading(false)
      })
  }, [])

  // Search functionality for the search bar
  const [searchResults, setSearchResults] = useState<Manga[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    const timeout = setTimeout(() => {
      const params = new URLSearchParams()
      params.set('limit', '12')
      params.set('query', search)

      fetch(`/api/manga?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            const processedManga = data.data.map((m: MangaDexManga) => {
              const coverFile = m.relationships.find((r: MangaDexRelationship) => r.type === 'cover_art')?.attributes?.fileName
              const mangaPlusUrl = m.attributes.links?.mangaplus ? `https://mangaplus.shueisha.co.jp/titles/${m.attributes.links.mangaplus}` : undefined
              return {
                id: m.id,
                title: m.attributes.title.en || Object.values(m.attributes.title)[0] || 'Untitled',
                coverImage: coverFile
                  ? `https://uploads.mangadex.org/covers/${m.id}/${coverFile}.256.jpg`
                  : '',
                description: m.attributes.description.en || '',
                mangaPlusUrl
              }
            }).filter((m: Manga) => m.coverImage && m.title && m.description)
            
            setSearchResults(processedManga)
          }
          setSearchLoading(false)
        })
        .catch(error => {
          console.error('Error searching manga:', error)
          setSearchLoading(false)
        })
    }, 400)
    return () => clearTimeout(timeout)
  }, [search])

  const handleRead = (mangaId: string) => {
    setPickerOpen(mangaId)
  }

  const displayedManga = search.trim() ? searchResults : mangaList
  const isLoading = search.trim() ? searchLoading : loading

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Manga Reader
          </h1>
          <p className="text-xl text-gray-600">
            Your ad-free manga reading experience
          </p>
        </div>
        <div className="flex justify-center my-8">
          <input
            type="text"
            placeholder="Search manga..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {search.trim() ? 'Search Results' : 'Featured Manga'}
          </h2>
          {isLoading ? (
            <div className="text-center text-gray-500">Loading manga...</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayedManga.map((manga) => (
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
          )}
          {!isLoading && displayedManga.length === 0 && (
            <div className="text-center text-gray-500">
              {search.trim() ? 'No manga found. Try a different search term.' : 'No featured manga available.'}
            </div>
          )}
        </div>
        {pickerOpen && (
          <ChapterPicker
            mangaId={pickerOpen}
            mangaPlusUrl={
              displayedManga.find((m) => m.id === pickerOpen)?.mangaPlusUrl
            }
            onClose={() => setPickerOpen(null)}
          />
        )}
      </div>
    </main>
  )
}
