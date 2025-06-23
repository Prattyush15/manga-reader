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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
              Manga Reader
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              Your premium ad-free manga reading experience
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search thousands of manga..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">
              {search.trim() ? (
                <>
                  Search Results 
                  <span className="text-lg font-normal text-gray-400 ml-2">
                    for &quot;{search}&quot;
                  </span>
                </>
              ) : (
                'Featured Manga'
              )}
            </h2>
            {search.trim() && (
              <button
                onClick={() => setSearch('')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-gray-400">Loading manga...</p>
              </div>
            </div>
          ) : displayedManga.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedManga.map((manga) => (
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
              <div className="text-gray-400 text-lg">
                {search.trim() ? (
                  <>
                    <div className="text-6xl mb-4">🔍</div>
                    <p>No manga found for &quot;{search}&quot;</p>
                    <p className="text-sm mt-2">Try a different search term</p>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">📚</div>
                    <p>No featured manga available</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
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
    </main>
  )
}
