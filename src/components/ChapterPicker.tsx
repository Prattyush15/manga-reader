import { useEffect, useState } from 'react'
import { fetchMangaChapters, Chapter } from '@/services/mangaService'
import { useRouter } from 'next/navigation'

interface ChapterPickerProps {
  mangaId: string
  onSelect?: (chapterId: string) => void
  onClose: () => void
}

export default function ChapterPicker({ mangaId, onSelect, onClose }: ChapterPickerProps) {
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
        <h2 className="text-xl font-bold mb-4">Select a Chapter</h2>
        {loading ? (
          <div className="text-center text-gray-500">Loading chapters...</div>
        ) : chapters.length === 0 ? (
          <div className="text-center text-gray-500">No chapters found.</div>
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