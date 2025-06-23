import { NextResponse } from 'next/server'

// Featured manga with alternative search terms for better matching
const FEATURED_MANGA = [
  {
    preferred: 'Kage no Jitsuryokusha ni Naritakute!',
    searchTerms: ['Kage no Jitsuryokusha ni Naritakute', 'The Eminence in Shadow'],
    excludeTerms: ['Master of Garden', 'Shichikage', 'side story', 'spin-off']
  },
  {
    preferred: 'Chainsaw Man',
    searchTerms: ['Chainsaw Man'],
    excludeTerms: []
  },
  {
    preferred: 'Berserk',
    searchTerms: ['Berserk'],
    excludeTerms: ['Gluttony', 'of Gluttony', 'Golden Age']
  },
  {
    preferred: 'The Breaker',
    searchTerms: ['The Breaker'],
    excludeTerms: ['New Waves', 'Eternal Force', 'Doom Breaker', 'Doom']
  },
  {
    preferred: 'Horimiya',
    searchTerms: ['Horimiya'],
    excludeTerms: ['piece', 'omake']
  },
  {
    preferred: 'Eyeshield 21',
    searchTerms: ['Eyeshield 21'],
    excludeTerms: ['Brain x Brave', 'side story', 'special']
  }
]

interface MangaDexManga {
  id: string
  attributes: {
    title: { en?: string, [key: string]: string | undefined }
    description: { en?: string }
    links?: { mangaplus?: string }
  }
  relationships: Array<{
    id: string
    type: string
    attributes?: {
      fileName?: string
    }
  }>
}

export async function GET() {
  try {
    const featuredManga: MangaDexManga[] = []

    for (const manga of FEATURED_MANGA) {
      let found = false
      
      // Try each search term until we find a good match
      for (const searchTerm of manga.searchTerms) {
        if (found) break
        
        try {
          const response = await fetch(
            `https://api.mangadex.org/manga?title=${encodeURIComponent(searchTerm)}&limit=15&includes[]=cover_art&availableTranslatedLanguage[]=en`,
            {
              headers: {
                'User-Agent': 'MangaReader/1.0',
              },
            }
          )

          if (response.ok) {
            const data = await response.json()
            if (data.data && data.data.length > 0) {
              // Look for the best match, excluding side stories
              let bestMatch = null
              
              for (const result of data.data) {
                const resultTitle = result.attributes.title.en || Object.values(result.attributes.title)[0] || ''
                
                // Check if this title should be excluded (side stories, etc.)
                const shouldExclude = manga.excludeTerms.some(excludeTerm => 
                  resultTitle.toLowerCase().includes(excludeTerm.toLowerCase())
                )
                
                if (shouldExclude) {
                  continue // Skip this result
                }
                
                // Check if this matches any of our search terms closely
                for (const term of manga.searchTerms) {
                  if (resultTitle.toLowerCase().includes(term.toLowerCase()) || 
                      term.toLowerCase().includes(resultTitle.toLowerCase())) {
                    
                    // For exact matches, prefer shorter titles (main series over spin-offs)
                    if (!bestMatch || resultTitle.length < bestMatch.attributes.title.en?.length || 0) {
                      bestMatch = result
                    }
                    break
                  }
                }
              }
              
              if (bestMatch) {
                featuredManga.push(bestMatch)
                found = true
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching ${searchTerm}:`, error)
        }
      }
      
      // If still not found, log it
      if (!found) {
        console.log(`Could not find manga: ${manga.preferred}`)
      }
    }

    return NextResponse.json({ data: featuredManga })
  } catch (error) {
    console.error('Error fetching featured manga:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured manga' },
      { status: 500 }
    )
  }
} 