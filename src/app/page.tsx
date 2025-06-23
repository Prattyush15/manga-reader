"use client"
import { useEffect, useState } from 'react'
import MangaCard from '@/components/MangaCard'
import MangaReader from '@/components/MangaReader'
import ChapterPicker from '@/components/ChapterPicker'
import { fetchMangaList, Manga } from '@/services/mangaService'

export default function Home() {
  const [mangaList, setMangaList] = useState<Manga[]>([])
  const [loading, setLoading] = useState(true)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [readerOpen, setReaderOpen] = useState(false)
  const [selectedMangaId, setSelectedMangaId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(() => {
      fetchMangaList(search).then((list) => {
        setMangaList(list)
        setLoading(false)
      })
    }, 400)
    return () => clearTimeout(timeout)
  }, [search])

  const handleRead = (mangaId: string) => {
    setSelectedMangaId(mangaId)
    setPickerOpen(true)
  }

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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Manga</h2>
          {loading ? (
            <div className="text-center text-gray-500">Loading manga...</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mangaList.map((manga) => (
                <div key={manga.id} className="relative">
                  <MangaCard
                    id={manga.id}
                    title={manga.title}
                    coverImage={manga.coverImage}
                    description={manga.description}
                  />
                  <button
                    className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                    onClick={() => handleRead(manga.id)}
                  >
                    Read
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {pickerOpen && selectedMangaId && (
          <ChapterPicker
            mangaId={selectedMangaId}
            onClose={() => setPickerOpen(false)}
          />
        )}
        {readerOpen && (
          <MangaReader pages={[]} onClose={() => setReaderOpen(false)} />
        )}
      </div>
    </main>
  )
}
