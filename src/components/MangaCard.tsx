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

  const favManga = useMemo(() => ({
    id,
    title,
    coverImage,
    description
  }), [id, title, coverImage, description])

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFavorite(id)) {
      removeFavorite(id)
    } else {
      addFavorite(favManga)
    }
  }

  return (
    <div className="group relative">
      {/* Cover Image */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
        <Image
          src={coverImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 hover:bg-black/70 transition-all duration-200 transform hover:scale-110"
        >
          <svg 
            className={`h-5 w-5 transition-colors duration-200 ${
              isFavorite(id) ? 'text-red-500 fill-current' : 'text-white'
            }`} 
            fill={isFavorite(id) ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Status Badge */}
        {status && (
          <div className="absolute top-3 left-3">
            <span className="inline-block bg-green-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full border border-green-400/30">
              {status}
            </span>
          </div>
        )}

        {/* Rating */}
        {rating && (
          <div className="absolute bottom-3 left-3">
            <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
              <svg className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-white text-sm font-medium">{rating.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-blue-400 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
} 