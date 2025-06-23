import { NextRequest, NextResponse } from 'next/server'

interface MangaDxChapterData {
  id: string
  attributes: {
    chapter?: string
    title?: string
    translatedLanguage?: string[]
    pages?: number
  }
}

interface MangaDxResponse {
  data: MangaDxChapterData[]
  total: number
}

interface ProcessedChapter {
  id: string
  title: string
  chapter: string
  pages: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: mangaId } = await params

  try {
    let chapters: ProcessedChapter[] = []
    let offset = 0
    let hasMore = true
    const limit = 100

    // Fetch up to 5000 chapters (in batches of 100)
    while (hasMore && offset < 5000) {
      const response = await fetch(
        `https://api.mangadex.org/manga/${mangaId}/feed?limit=${limit}&offset=${offset}&translatedLanguage[]=en&order[chapter]=asc`,
        {
          headers: {
            'User-Agent': 'MangaReader/1.0',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`MangaDex API responded with status: ${response.status}`)
      }

      const data: MangaDxResponse = await response.json()
      if (!data.data) break

      // Only include English chapters with a chapter number and with pages
      const batch = data.data
        .filter((c: MangaDxChapterData) =>
          c.attributes &&
          c.attributes.chapter &&
          c.attributes.translatedLanguage?.includes('en') &&
          c.attributes.pages && c.attributes.pages > 0
        )
        .map((c: MangaDxChapterData) => ({
          id: c.id,
          title: c.attributes.title || `Chapter ${c.attributes.chapter}`,
          chapter: c.attributes.chapter as string,
          pages: c.attributes.pages || 0,
        }))

      chapters = chapters.concat(batch)
      hasMore = data.total > offset + data.data.length
      offset += data.data.length
      if (data.data.length < limit) break
    }

    // Deduplicate by chapter number, keep the one with the most pages
    const deduped: { [chapter: string]: ProcessedChapter } = {}
    for (const ch of chapters) {
      if (!ch.chapter) continue
      if (!deduped[ch.chapter] || (ch.pages || 0) > (deduped[ch.chapter].pages || 0)) {
        deduped[ch.chapter] = ch
      }
    }

    // Sort by chapter number (as float)
    const sortedChapters = Object.values(deduped).sort((a, b) => parseFloat(a.chapter) - parseFloat(b.chapter))

    return NextResponse.json({ chapters: sortedChapters })
  } catch (error) {
    console.error('Error fetching chapters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    )
  }
} 