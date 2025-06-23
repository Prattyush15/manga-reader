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
  const res = await fetch(`/api/manga/${mangaId}/chapters`)
  const data = await res.json()
  
  if (data.error) {
    throw new Error(data.error)
  }
  
  return data.chapters || []
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