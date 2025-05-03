// MangaDex API docs: https://api.mangadex.org/docs.html

export interface Manga {
  id: string
  title: string
  coverImage: string
  description: string
}

export interface Chapter {
  id: string
  title: string
  chapter: string
  pages?: number
}

export async function fetchMangaList(query?: string): Promise<Manga[]> {
  let url = 'https://api.mangadex.org/manga?limit=12&order[followedCount]=desc&includes[]=cover_art&availableTranslatedLanguage[]=en'
  if (query) {
    url += `&title=${encodeURIComponent(query)}`
  }
  const res = await fetch(url)
  const data = await res.json()
  return data.data
    .map((m: any) => {
      const coverFile = m.relationships.find((r: any) => r.type === 'cover_art')?.attributes?.fileName
      return {
        id: m.id,
        title: m.attributes.title.en || Object.values(m.attributes.title)[0],
        coverImage: coverFile
          ? `https://uploads.mangadex.org/covers/${m.id}/${coverFile}.256.jpg`
          : '',
        description: m.attributes.description.en || '',
      }
    })
    .filter((m: Manga) => m.coverImage && m.title && m.description)
}

export async function fetchMangaChapters(mangaId: string): Promise<Chapter[]> {
  let chapters: Chapter[] = []
  let offset = 0
  let hasMore = true
  const limit = 100
  // Fetch up to 5000 chapters (in batches of 100)
  while (hasMore && offset < 5000) {
    const res = await fetch(`https://api.mangadex.org/manga/${mangaId}/feed?limit=${limit}&offset=${offset}&translatedLanguage[]=en&order[chapter]=asc`)
    const data = await res.json()
    if (!data.data) break
    // Only include English chapters with a chapter number
    const batch = data.data
      .filter((c: any) =>
        c.attributes &&
        c.attributes.chapter &&
        c.attributes.translatedLanguage?.includes('en')
      )
      .map((c: any) => ({
        id: c.id,
        title: c.attributes.title || `Chapter ${c.attributes.chapter}`,
        chapter: c.attributes.chapter,
        pages: c.attributes.pages || 0,
      }))
    chapters = chapters.concat(batch)
    hasMore = data.total > offset + data.data.length
    offset += data.data.length
    if (data.data.length < limit) break // No more data
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