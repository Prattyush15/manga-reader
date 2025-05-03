"use client"

import { useCallback, useEffect, useState } from 'react'

export interface FavoriteManga {
  id: string
  title: string
  coverImage: string
  description: string
}

const FAVORITES_KEY = 'manga-favorites-v1'

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteManga[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) return JSON.parse(stored)
    }
    return []
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) setFavorites(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    }
  }, [favorites])

  const addFavorite = useCallback((manga: FavoriteManga) => {
    setFavorites((prev) => {
      if (prev.some((m) => m.id === manga.id)) return prev
      return [...prev, manga]
    })
  }, [])

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const isFavorite = useCallback((id: string) => {
    return favorites.some((m) => m.id === id)
  }, [favorites])

  return { favorites, addFavorite, removeFavorite, isFavorite }
} 