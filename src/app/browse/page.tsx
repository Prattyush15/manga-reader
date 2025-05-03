"use client"
import { useEffect, useState } from 'react'
import MangaCard from '@/components/MangaCard'

interface Genre {
  id: string
  name: string
}

interface Manga {
  id: string
  title: string
  coverImage: string
  description: string
}

export default function BrowsePage() {
  const [search, setSearch] = useState('')
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [mangaResults, setMangaResults] = useState<Manga[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch genres from MangaDex
  useEffect(() => {
    fetch('https://api.mangadex.org/manga/tag')
      .then(res => res.json())
      .then(data => {
        setGenres(data.data.map((g: any) => ({ id: g.id, name: g.attributes.name.en })))
      })
  }, [])

  // Fetch manga results
  useEffect(() => {
    setLoading(true)
    setError('')
    let url = `https://api.mangadex.org/manga?limit=18&order[relevance]=desc&availableTranslatedLanguage[]=en&includes[]=cover_art`
    if (search) url += `&title=${encodeURIComponent(search)}`
    if (selectedGenres.length > 0) {
      selectedGenres.forEach((id) => {
        url += `&includedTags[]=${id}`
      })
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setMangaResults(
          data.data.map((m: any) => {
            const coverFile = m.relationships.find((r: any) => r.type === 'cover_art')?.attributes?.fileName
            return {
              id: m.id,
              title: m.attributes.title.en || Object.values(m.attributes.title)[0],
              coverImage: coverFile
                ? `https://uploads.mangadex.org/covers/${m.id}/${coverFile}.256.jpg`
                : '',
              description: m.attributes.description.en || '',
            }
          })
        )
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to fetch manga. Please try again.')
        setLoading(false)
      })
  }, [search, selectedGenres])

  const handleGenreChange = (id: string) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
  }

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
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre.id}
                type="button"
                className={`px-3 py-1 rounded-full border text-sm font-semibold transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${selectedGenres.includes(genre.id)
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-[#232d23] text-green-400 border-green-600 hover:bg-green-700/30'}`}
                onClick={() => handleGenreChange(genre.id)}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      {loading && <div className="text-green text-lg">Loading manga...</div>}
      {error && <div className="text-red-400 text-lg">{error}</div>}
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {mangaResults.map((manga) => (
          <MangaCard
            key={manga.id}
            id={manga.id}
            title={manga.title}
            coverImage={manga.coverImage}
            description={manga.description}
          />
        ))}
      </div>
      {!loading && mangaResults.length === 0 && (
        <div className="text-green text-lg mt-8">No manga found. Try a different search or genre.</div>
      )}
    </main>
  )
} 