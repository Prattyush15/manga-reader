import { fetchChapterPages, fetchMangaChapters, Chapter } from '@/services/mangaService'
import Link from 'next/link'
import ChapterSelector from '@/components/ChapterSelector'
import MangaReaderClient from '@/components/MangaReaderClient'
import ScrollToTopOnMount from '@/components/ScrollToTopOnMount'
import { useFavorites } from '@/hooks/useFavorites'
import { useMemo } from 'react'

interface ReaderPageProps {
  params: { chapterId: string }
}

async function fetchChapterInfo(chapterId: string) {
  const res = await fetch(`https://api.mangadex.org/chapter/${chapterId}`)
  const data = await res.json()
  return data.data
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  // Fetch current chapter info to get mangaId
  const chapterInfo = await fetchChapterInfo(params.chapterId)
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
  const currentIdx = chapters.findIndex((c) => c.id === params.chapterId)
  const prevChapter = currentIdx > 0 ? chapters[currentIdx - 1] : null
  const nextChapter = currentIdx >= 0 && currentIdx < chapters.length - 1 ? chapters[currentIdx + 1] : null
  const currentChapter = chapters[currentIdx]

  const pages = await fetchChapterPages(params.chapterId)

  // Favorite button logic (client only)
  function FavoriteButton() {
    const { isFavorite, addFavorite, removeFavorite } = useFavorites()
    const favorited = useMemo(() => isFavorite(mangaId), [isFavorite, mangaId])
    const handleFavorite = () => {
      if (favorited) {
        removeFavorite(mangaId)
      } else {
        addFavorite({ id: mangaId, title: mangaTitle, coverImage, description: mangaDescription })
      }
    }
    return (
      <button
        aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        onClick={handleFavorite}
        className="ml-4 p-1 rounded-full bg-transparent hover:bg-green-600/20 transition"
        style={{ lineHeight: 0 }}
      >
        {favorited ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="#1db954" viewBox="0 0 24 24" width="28" height="28"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#1db954" strokeWidth="2" viewBox="0 0 24 24" width="28" height="28"><path d="M12.1 8.64l-.1.1-.11-.11C10.14 6.6 7.1 7.24 5.6 9.28c-1.5 2.04-1.1 5.12 1.4 7.05l5.1 4.55 5.1-4.55c2.5-1.93 2.9-5.01 1.4-7.05-1.5-2.04-4.54-2.68-6.4-.64z"/></svg>
        )}
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      <ScrollToTopOnMount />
      <div className="w-full max-w-4xl px-4 py-6 flex flex-col items-center">
        <div className="w-full flex flex-col sm:flex-row sm:justify-between items-center mb-6 gap-4">
          <Link href="/" className="text-green font-bold hover:underline self-start">← Home</Link>
          <ChapterSelector
            chapters={chapters}
            currentChapterId={params.chapterId}
            prevChapterId={prevChapter?.id}
            nextChapterId={nextChapter?.id}
          />
          {currentChapter && (
            <span className="ml-2 text-green text-lg font-bold flex items-center">
              {currentChapter.title || `Chapter ${currentChapter.chapter}`}
              <FavoriteButton />
            </span>
          )}
        </div>
        {pages.length === 0 ? (
          <div className="text-center text-gray-300 mt-20">No pages found for this chapter.</div>
        ) : (
          <MangaReaderClient
            pages={pages}
            chapters={chapters}
            currentChapterId={params.chapterId}
            prevChapterId={prevChapter?.id}
            nextChapterId={nextChapter?.id}
          />
        )}
      </div>
    </div>
  )
} 