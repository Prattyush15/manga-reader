"use client"
import { useState, useRef, useEffect } from 'react'
import PageNavigationBar from './PageNavigationBar'

interface Chapter {
  id: string
  title: string
  chapter: string
}

interface MangaReaderClientProps {
  pages: string[]
  chapters: Chapter[]
  currentChapterId: string
  prevChapterId?: string
  nextChapterId?: string
}

export default function MangaReaderClient({ pages, chapters, currentChapterId, prevChapterId, nextChapterId }: MangaReaderClientProps) {
  const [view, setView] = useState<'vertical' | 'horizontal'>('vertical')
  const [currentPage, setCurrentPage] = useState(0)
  const [showUpArrow, setShowUpArrow] = useState(false)
  const [noGaps, setNoGaps] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const horizontalImgRef = useRef<HTMLDivElement>(null)

  // Show up arrow when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      setShowUpArrow(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Horizontal navigation
  const goPrev = () => setCurrentPage((p) => Math.max(0, p - 1))
  const goNext = () => setCurrentPage((p) => Math.min(pages.length - 1, p + 1))

  // Keyboard navigation for horizontal mode
  useEffect(() => {
    if (view !== 'horizontal') return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, currentPage, pages.length])

  // Reset page when switching view
  useEffect(() => {
    setCurrentPage(0)
  }, [view, pages])

  // Scroll to top of image in horizontal mode when page changes
  useEffect(() => {
    if (view === 'horizontal' && horizontalImgRef.current) {
      horizontalImgRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentPage, view])

  return (
    <div className="w-full flex flex-col items-center relative">
      {/* View Toggle */}
      <div className="flex gap-4 mb-6">
        <button
          className={`btn-green ${view === 'vertical' ? 'ring-2 ring-green-400' : ''}`}
          onClick={() => setView('vertical')}
        >
          Vertical View
        </button>
        <button
          className={`btn-green ${view === 'horizontal' ? 'ring-2 ring-green-400' : ''}`}
          onClick={() => setView('horizontal')}
        >
          Horizontal View
        </button>
        {view === 'vertical' && (
          <button
            className={`btn-green ml-4 ${noGaps ? 'ring-2 ring-green-400' : ''}`}
            onClick={() => setNoGaps((g) => !g)}
          >
            {noGaps ? 'Show Gaps' : 'Remove Gaps'}
          </button>
        )}
      </div>
      {/* Manga Pages */}
      {view === 'vertical' ? (
        <>
          <div
            ref={containerRef}
            className={`flex flex-col ${noGaps ? 'gap-0' : 'gap-8'} w-full items-center`}
          >
            {pages.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Page ${idx + 1}`}
                className="w-full max-w-3xl rounded shadow bg-white"
                loading="lazy"
              />
            ))}
          </div>
          <PageNavigationBar
            view={view}
            currentPage={0}
            totalPages={pages.length}
            goPrev={() => {}}
            goNext={() => {}}
            canPrev={!!prevChapterId}
            canNext={!!nextChapterId}
            prevChapterId={prevChapterId}
            nextChapterId={nextChapterId}
            chapters={chapters}
            currentChapterId={currentChapterId}
            showPageNav={false}
            showChapterNav={true}
          />
        </>
      ) : (
        <>
          <div ref={horizontalImgRef} className="flex flex-col items-center w-full">
            <img
              src={pages[currentPage]}
              alt={`Page ${currentPage + 1}`}
              className="w-full max-w-3xl rounded shadow bg-white"
              loading="lazy"
            />
          </div>
          <PageNavigationBar
            view={view}
            currentPage={currentPage}
            totalPages={pages.length}
            goPrev={goPrev}
            goNext={goNext}
            canPrev={currentPage > 0}
            canNext={currentPage < pages.length - 1}
            prevChapterId={prevChapterId}
            nextChapterId={nextChapterId}
            chapters={chapters}
            currentChapterId={currentChapterId}
            showPageNav={true}
            showChapterNav={true}
          />
        </>
      )}
      {/* Floating Up Arrow */}
      {showUpArrow && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-green-600 hover:bg-green-500 text-black rounded-full p-3 shadow-lg transition-colors"
          aria-label="Back to top"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M12 19V5m0 0l-7 7m7-7l7 7" stroke="#101a14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}
    </div>
  )
} 