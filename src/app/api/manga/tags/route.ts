import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://api.mangadex.org/manga/tag', {
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
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
} 