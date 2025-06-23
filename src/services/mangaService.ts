// MangaDex API docs: https://api.mangadex.org/docs.html

export interface Manga {
  id: string
  title: string
  coverImage: string
  description: string
  mangaPlusUrl?: string
}

export interface Chapter {
  id: string
  title: string
  chapter: string
  pages: number
}

interface MangaDexRelationship {
  id: string
  type: string
  attributes?: {
    fileName?: string
  }
}

interface MangaDexManga {
  id:string
  attributes: {
    title: { en?: string, [key: string]: string | undefined }
    description: { en?: string }
    links?: { mangaplus?: string }
  }
  relationships: MangaDexRelationship[]
}

interface MangaDxChapterData {
  id: string
  attributes: {
    chapter?: string
    title?: string
    translatedLanguage?: string[]
    pages?: number
  }
}

interface MangaDxChapterResponse {
  data: MangaDxChapterData[]
  total: number
}

export async function fetchMangaList(query?: string): Promise<Manga[]> {
  const params = new URLSearchParams()
  params.set('limit', '12')
  if (query) params.set('query', query)

  const res = await fetch(`/api/manga?${params.toString()}`)
  const data = await res.json()
  
  if (data.error) {
    throw new Error(data.error)
  }
  
  return data.data
    .map((m: MangaDexManga) => {
      const coverFile = m.relationships.find((r) => r.type === 'cover_art')?.attributes?.fileName
      const mangaPlusUrl = m.attributes.links?.mangaplus ? `https://mangaplus.shueisha.co.jp/titles/${m.attributes.links.mangaplus}` : undefined
      return {
        id: m.id,
        title: m.attributes.title.en || Object.values(m.attributes.title)[0],
        coverImage: coverFile
          ? `https://uploads.mangadex.org/covers/${m.id}/${coverFile}.256.jpg`
          : '',
        description: m.attributes.description.en || '',
        mangaPlusUrl,
      }
    })
    .filter((m: Manga) => m.coverImage && m.title && m.description)
}

export async function fetchMangaChapters(mangaId: string): Promise<Chapter[]> {
  // Check if we're on the server (no window object) or client
  const isServer = typeof window === 'undefined'
  
  let url: string
  if (isServer) {
    // Server-side: use direct MangaDx API call
    try {
      let chapters: Chapter[] = []
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
            cache: 'no-store'
          }
        )

        if (!response.ok) {
          throw new Error(`MangaDex API responded with status: ${response.status}`)
        }

        const data: MangaDxChapterResponse = await response.json()
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
      const deduped: { [chapter: string]: Chapter } = {}
      for (const ch of chapters) {
        if (!ch.chapter) continue
        if (!deduped[ch.chapter] || (ch.pages || 0) > (deduped[ch.chapter].pages || 0)) {
          deduped[ch.chapter] = ch
        }
      }

      // Sort by chapter number (as float)
      return Object.values(deduped).sort((a, b) => parseFloat(a.chapter) - parseFloat(b.chapter))
    } catch (error) {
      console.error('Error fetching chapters server-side:', error)
      return []
    }
  } else {
    // Client-side: use our API route
    url = `/api/manga/${mangaId}/chapters`
    
    try {
      const res = await fetch(url)
      const data = await res.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      return data.chapters || []
    } catch (error) {
      console.error('Error fetching chapters client-side:', error)
      return []
    }
  }
}

export async function fetchChapterPages(chapterId: string): Promise<string[]> {
  try {
    const res = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`)
    const data = await res.json()
    if (!data.chapter || !data.chapter.data) return []
    const baseUrl = data.baseUrl
    const hash = data.chapter.hash
    const pages = data.chapter.data
    return pages.map((file: string) => `${baseUrl}/data/${hash}/${file}`)
  } catch {
    return []
  }
} 