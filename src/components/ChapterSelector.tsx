"use client"
import Link from 'next/link'

interface Chapter {
  id: string
  title: string
  chapter: string
}

interface ChapterSelectorProps {
  chapters: Chapter[]
  currentChapterId: string
  prevChapterId?: string
  nextChapterId?: string
}

export default function ChapterSelector({ chapters, currentChapterId, prevChapterId, nextChapterId }: ChapterSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto">
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
      <div className="flex gap-2 ml-2">
        {prevChapterId && (
          <Link href={`/read/${prevChapterId}`} className="btn-green">← Previous</Link>
        )}
        {nextChapterId && (
          <Link href={`/read/${nextChapterId}`} className="btn-green">Next →</Link>
        )}
      </div>
    </div>
  )
} 