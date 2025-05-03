import Image from 'next/image'
import { useFavorites } from '@/hooks/useFavorites'
import { useMemo } from 'react'

interface MangaCardProps {
  id: string
  title: string
  coverImage: string
  description: string
  rating?: number
  status?: string
}

export default function MangaCard({ id, title, coverImage, description, rating, status }: MangaCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const favorited = useMemo(() => isFavorite(id), [isFavorite, id])

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (favorited) {
      removeFavorite(id)
    } else {
      addFavorite({ id, title, coverImage, description })
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
      <button
        aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        onClick={handleFavorite}
        className="absolute top-2 right-2 z-10 rounded-full bg-transparent hover:ring-2 hover:ring-green-400 focus:ring-2 focus:ring-green-400 transition"
        style={{ padding: 0, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 0, background: 'transparent' }}
      >
        {favorited ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="#1db954" viewBox="0 0 24 24" width="24" height="24" style={{ display: 'block' }}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#1db954" strokeWidth="2" viewBox="0 0 24 24" width="24" height="24" style={{ display: 'block' }}><path d="M12.1 8.64l-.1.1-.11-.11C10.14 6.6 7.1 7.24 5.6 9.28c-1.5 2.04-1.1 5.12 1.4 7.05l5.1 4.55 5.1-4.55c2.5-1.93 2.9-5.01 1.4-7.05-1.5-2.04-4.54-2.68-6.4-.64z"/></svg>
        )}
      </button>
      <div className="relative h-64">
        <Image
          src={coverImage}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {rating && (
          <div className="flex items-center mb-2">
            <span className="text-yellow-500 mr-1">★</span>
            <span className="text-gray-600">{rating.toFixed(1)}</span>
          </div>
        )}
        {status && (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
            {status}
          </span>
        )}
        <p className="text-gray-600 text-sm line-clamp-3">{description}</p>
      </div>
    </div>
  )
} 