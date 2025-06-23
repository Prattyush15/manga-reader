import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const limit = searchParams.get('limit') || '12'
  const selectedGenres = searchParams.getAll('genre')

  try {
    let url = `https://api.mangadex.org/manga?limit=${limit}&order[followedCount]=desc&includes[]=cover_art&availableTranslatedLanguage[]=en`
    
    if (query) {
      url += `&title=${encodeURIComponent(query)}`
    }
    
    if (selectedGenres.length > 0) {
      selectedGenres.forEach((id) => {
        url += `&includedTags[]=${encodeURIComponent(id)}`
      })
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MangaReader/1.0',
      },
    })

    if (!response.ok) {
      throw new Error(`MangaDex API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching manga:', error)
    return NextResponse.json(
      { error: 'Failed to fetch manga' },
      { status: 500 }
    )
  }
} 