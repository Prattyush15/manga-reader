"use client";
import { useFavorites } from "@/hooks/useFavorites";
import { useMemo } from "react";

interface FavoriteButtonProps {
  manga: {
    id: string;
    title: string;
    coverImage: string;
    description: string;
  };
}

export default function FavoriteButton({ manga }: FavoriteButtonProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorited = useMemo(() => isFavorite(manga.id), [isFavorite, manga.id]);

  return (
    <button
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className={`ml-4 p-2 rounded-full transition-colors ${
        favorited
          ? "text-green-400 hover:bg-green-900/30"
          : "text-white hover:bg-green-900/30"
      }`}
      onClick={() =>
        favorited
          ? removeFavorite(manga.id)
          : addFavorite(manga)
      }
    >
      {favorited ? (
        <span role="img" aria-label="Favorited">❤️</span>
      ) : (
        <span role="img" aria-label="Not favorited">🤍</span>
      )}
    </button>
  );
} 