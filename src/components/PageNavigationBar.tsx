"use client"
import Link from 'next/link'

interface Chapter {
  id: string
  title: string
  chapter: string
}

interface PageNavigationBarProps {
  view: 'vertical' | 'horizontal'
  currentPage: number
  totalPages: number
  goPrev: () => void
  goNext: () => void
  canPrev: boolean
  canNext: boolean
  prevChapterId?: string
  nextChapterId?: string
  chapters: Chapter[]
  currentChapterId: string
  showPageNav?: boolean
  showChapterNav?: boolean
}

export default function PageNavigationBar({
  view,
  currentPage,
  totalPages,
  goPrev,
  goNext,
  canPrev,
  canNext,
  prevChapterId,
  nextChapterId,
  chapters,
  currentChapterId,
  showPageNav = false,
  showChapterNav = true,
}: PageNavigationBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 my-4 justify-center w-full">
      {/* Page navigation */}
      {showPageNav && view === 'horizontal' && (
        <>
          <button
            className="btn-green"
            onClick={goPrev}
            disabled={!canPrev}
          >
            ← Prev Page
          </button>
          <span className="text-green text-lg font-bold">
            Page {currentPage + 1} / {totalPages}
          </span>
          <button
            className="btn-green"
            onClick={goNext}
            disabled={!canNext}
          >
            Next Page →
          </button>
        </>
      )}
      {/* Chapter navigation */}
      {showChapterNav && (
        <>
          {prevChapterId && (
            <Link href={`/read/${prevChapterId}`} className="btn-green">← Previous Chapter</Link>
          )}
          <form action="" onChange={e => {
            const select = e.currentTarget.querySelector('select') as HTMLSelectElement
            if (select && select.value) window.location.href = `/read/${select.value}`
          }}>
            <label htmlFor="chapter-select" className="mr-2 text-green font-semibold">Chapter:</label>
            <select
              id="chapter-select"
              className="bg-[#182820] text-green border border-green-600 rounded px-2 py-1"
              value={currentChapterId}
              onChange={e => window.location.href = `/read/${e.target.value}`}
            >
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title || `Chapter ${chapter.chapter}`}
                </option>
              ))}
            </select>
          </form>
          {nextChapterId && (
            <Link href={`/read/${nextChapterId}`} className="btn-green">Next Chapter →</Link>
          )}
        </>
      )}
    </div>
  )
} 