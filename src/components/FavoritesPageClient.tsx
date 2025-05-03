"use client";
import { useFavorites } from '@/hooks/useFavorites';
import MangaCard from '@/components/MangaCard';
import { useState, useEffect } from 'react';
import ChapterPicker from '@/components/ChapterPicker';
import { useRouter } from 'next/navigation';

export default function FavoritesPageClient() {
  const { favorites } = useFavorites();
  const [pickerOpen, setPickerOpen] = useState<string | null>(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRead = (mangaId: string) => {
    setPickerOpen(mangaId);
  };

  const handleChapterSelect = (chapterId: string) => {
    setPickerOpen(null);
    router.push(`/read/${chapterId}`);
  };

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold mb-8">Your Favorites</h1>
      {favorites.length === 0 ? (
        <div className="text-green text-lg">No favorites yet. Add some manga to your favorites!</div>
      ) : (
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favorites.map((manga) => (
            <div key={manga.id} className="relative">
              <MangaCard
                id={manga.id}
                title={manga.title}
                coverImage={manga.coverImage}
                description={manga.description}
              />
              <button
                className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                onClick={() => handleRead(manga.id)}
              >
                Read
              </button>
            </div>
          ))}
        </div>
      )}
      {pickerOpen && (
        <ChapterPicker
          mangaId={pickerOpen}
          onSelect={handleChapterSelect}
          onClose={() => setPickerOpen(null)}
        />
      )}
    </main>
  );
} 