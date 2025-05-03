import { useState } from 'react'

interface MangaReaderProps {
  pages: string[]
  onClose?: () => void
}

export default function MangaReader({ pages, onClose }: MangaReaderProps) {
  const [currentPage, setCurrentPage] = useState(0)

  const goPrev = () => setCurrentPage((p) => Math.max(0, p - 1))
  const goNext = () => setCurrentPage((p) => Math.min(pages.length - 1, p + 1))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full p-4 flex flex-col items-center">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close"
          >
            ×
          </button>
        )}
        <div className="mb-4">
          <img
            src={pages[currentPage]}
            alt={`Page ${currentPage + 1}`}
            className="max-h-[70vh] rounded shadow"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={goPrev}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-gray-700">
            Page {currentPage + 1} / {pages.length}
          </span>
          <button
            onClick={goNext}
            disabled={currentPage === pages.length - 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
} 