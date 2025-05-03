import { useEffect, useState } from 'react'
import { fetchMangaChapters, Chapter } from '@/services/mangaService'
import { useRouter } from 'next/navigation'

interface ChapterPickerProps {
  mangaId: string
  onSelect?: (chapterId: string) => void
  onClose: () => void
  mangaPlusUrl?: string
}

export default function ChapterPicker({ mangaId, onSelect, onClose, mangaPlusUrl }: ChapterPickerProps) {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchMangaChapters(mangaId).then((chs) => {
      setChapters(chs)
      setLoading(false)
    })
  }, [mangaId])

  const handleSelect = (chapterId: string) => {
    onClose()
    router.push(`/read/${chapterId}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-black">Select a Chapter</h2>
        {loading ? (
          <div className="text-center text-gray-500">Loading chapters...</div>
        ) : chapters.length === 0 ? (
          <div className="text-center text-gray-500">
            No chapters found.<br />
            {mangaPlusUrl ? (
              <div className="mt-4 flex flex-col items-center">
                <span className="mb-2 text-black font-semibold">No chapters available on MangaDex. Read on MangaPlus instead:</span>
                <a
                  href={mangaPlusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-pink-600 text-white px-4 py-2 rounded shadow hover:bg-pink-700 font-bold text-center"
                >
                  Read on MangaPlus
                </a>
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center">
                <span className="mb-2 text-black font-semibold">No chapters available on MangaDex. Please check the official MangaPlus or VIZ site for this manga.</span>
              </div>
            )}
          </div>
        ) : (
          <ul className="max-h-64 overflow-y-auto divide-y">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <button
                  className="w-full text-left px-2 py-2 hover:bg-gray-100 rounded"
                  onClick={() => handleSelect(chapter.id)}
                >
                  {chapter.title || `Chapter ${chapter.chapter}`}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
} 