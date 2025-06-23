import { NextRequest, NextResponse } from 'next/server'

interface MangaDexChapter {
  attributes: {
    chapter?: string
    translatedLanguage?: string[]
    pages?: number
  }
}

// Helper function to retry API calls with exponential backoff
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 2): Promise<Response> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(8000), // 8 second timeout
      })
      
      if (response.ok) {
        return response
      }
      
      // If it's a rate limit or server error, retry
      if (response.status >= 500 || response.status === 429) {
        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i))) // Exponential backoff
          continue
        }
      }
      
      return response
    } catch (error) {
      if (i === maxRetries) {
        throw error
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
    }
  }
  
  throw new Error('Max retries exceeded')
}

// Helper function to check if a manga has available chapters
async function hasAvailableChapters(mangaId: string): Promise<boolean> {
  try {
    const response = await fetchWithRetry(
      `https://api.mangadex.org/manga/${mangaId}/feed?limit=5&translatedLanguage[]=en&order[chapter]=asc`,
      {
        headers: {
          'User-Agent': 'MangaReader/1.0',
        },
      }
    )

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    
    // Check if there are any chapters with valid chapter numbers and pages
    if (data.data && data.data.length > 0) {
      return data.data.some((chapter: MangaDexChapter) => 
        chapter.attributes && 
        chapter.attributes.chapter && 
        chapter.attributes.translatedLanguage?.includes('en') &&
        (!chapter.attributes.pages || chapter.attributes.pages > 0) // Accept chapters without page count or with positive page count
      )
    }
    
    return false
  } catch (error) {
    console.error(`Error checking chapters for manga ${mangaId}:`, error)
    return false
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const limit = searchParams.get('limit') || '8'
  const selectedGenres = searchParams.getAll('genre')

  try {
    // Fetch more manga than requested to account for filtering
    const fetchLimit = Math.max(parseInt(limit) * 2, 16)
    let url = `https://api.mangadex.org/manga?limit=${fetchLimit}&order[followedCount]=desc&includes[]=cover_art&availableTranslatedLanguage[]=en`
    
    if (query) {
      url += `&title=${encodeURIComponent(query)}`
    }
    
    if (selectedGenres.length > 0) {
      selectedGenres.forEach((id) => {
        url += `&includedTags[]=${encodeURIComponent(id)}`
      })
    }

    const response = await fetchWithRetry(url, {
      headers: {
        'User-Agent': 'MangaReader/1.0',
      },
    })

    if (!response.ok) {
      throw new Error(`MangaDex API responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.data || data.data.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Filter manga with available chapters
    const mangaWithChapters = []
    for (const manga of data.data) {
      const hasChapters = await hasAvailableChapters(manga.id)
      if (hasChapters) {
        mangaWithChapters.push(manga)
        if (mangaWithChapters.length >= parseInt(limit)) {
          break // We have enough manga with chapters
        }
      }
    }

    return NextResponse.json({ data: mangaWithChapters })
  } catch (error) {
    console.error('Error fetching manga:', error)
    return NextResponse.json(
      { error: 'Failed to fetch manga' },
      { status: 500 }
    )
  }
} 