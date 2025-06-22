import { fetchChapterPages, fetchMangaChapters, Chapter } from '@/services/mangaService'
import Link from 'next/link'
import ChapterSelector from '@/components/ChapterSelector'
import MangaReaderClient from '@/components/MangaReaderClient'
import ScrollToTopOnMount from '@/components/ScrollToTopOnMount'
import FavoriteButton from '@/components/FavoriteButton'
import { useMemo } from 'react'

interface ReaderPageProps {
  params: { chapterId: string }
}

async function fetchChapterInfo(chapterId: string) {
  try {
    const res = await fetch(`https://api.mangadex.org/chapter/${chapterId}`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch chapter info');
    }
    const data = await res.json();
    return data.data;
  } catch (error) {
    return null;
  }
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { chapterId } = params

  // Fetch current chapter info to get mangaId
  const chapterInfo = await fetchChapterInfo(chapterId)
  if (!chapterInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-500 text-2xl">
        Failed to load chapter. Please try again later.
      </div>
    )
  }
  const mangaId = chapterInfo?.relationships?.find((r: any) => r.type === 'manga')?.id
  const mangaTitle = chapterInfo?.relationships?.find((r: any) => r.type === 'manga')?.attributes?.title?.en || 'Manga'
  const mangaDescription = chapterInfo?.relationships?.find((r: any) => r.type === 'manga')?.attributes?.description?.en || ''
  const coverFile = chapterInfo?.relationships?.find((r: any) => r.type === 'cover_art')?.attributes?.fileName
  const coverImage = coverFile && mangaId ? `https://uploads.mangadex.org/covers/${mangaId}/${coverFile}.256.jpg` : ''

  // Fetch all chapters for this manga
  let chapters: Chapter[] = []
  if (mangaId) {
    chapters = await fetchMangaChapters(mangaId)
  }

  // Find current, previous, and next chapter
  const currentIdx = chapters.findIndex((c) => c.id === chapterId)
  const prevChapter = currentIdx > 0 ? chapters[currentIdx - 1] : null
  const nextChapter = currentIdx >= 0 && currentIdx < chapters.length - 1 ? chapters[currentIdx + 1] : null
  const currentChapter = chapters[currentIdx]

  const pages = await fetchChapterPages(chapterId)

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      <ScrollToTopOnMount />
      <div className="w-full max-w-4xl px-4 py-6 flex flex-col items-center">
        <div className="w-full flex flex-col sm:flex-row sm:justify-between items-center mb-6 gap-4">
          <Link href="/" className="text-green font-bold hover:underline self-start">← Home</Link>
          <ChapterSelector
            chapters={chapters}
            currentChapterId={chapterId}
            prevChapterId={prevChapter?.id}
            nextChapterId={nextChapter?.id}
          />
          {currentChapter && (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{currentChapter.title || `Chapter ${currentChapter.chapter}`}</h1>
              <FavoriteButton manga={{ id: mangaId, title: mangaTitle, coverImage, description: mangaDescription }} />
            </div>
          )}
        </div>
        {pages.length === 0 ? (
          <div className="text-center text-gray-300 mt-20">No pages found for this chapter.</div>
        ) : (
          <MangaReaderClient
            pages={pages}
            chapters={chapters}
            currentChapterId={chapterId}
            prevChapterId={prevChapter?.id}
            nextChapterId={nextChapter?.id}
          />
        )}
      </div>
    </div>
  )
} 