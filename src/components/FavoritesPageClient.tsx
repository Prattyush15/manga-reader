"use client";
import { useFavorites } from '@/hooks/useFavorites';
import MangaCard from '@/components/MangaCard';
import { useState, useEffect } from 'react';
import ChapterPicker from '@/components/ChapterPicker';

export default function FavoritesPageClient() {
  const { favorites } = useFavorites();
  const [pickerOpen, setPickerOpen] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRead = (mangaId: string) => {
    setPickerOpen(mangaId);
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            Your Favorites
          </h1>
          <p className="text-xl text-gray-400">
            Your personally curated manga collection
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {favorites.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">📚</div>
              <h2 className="text-2xl font-semibold text-gray-300 mb-4">No favorites yet</h2>
              <p className="text-gray-400 text-lg mb-8">
                Start building your manga library by adding favorites from the browse page!
              </p>
              <a
                href="/browse"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Manga
              </a>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl px-6 py-3">
                  <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-white font-medium">
                    {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Manga Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favorites.map((manga) => (
                  <div key={manga.id} className="group relative">
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:transform hover:scale-105">
                      <MangaCard
                        id={manga.id}
                        title={manga.title}
                        coverImage={manga.coverImage}
                        description={manga.description}
                      />
                      <div className="p-4">
                        <button
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105"
                          onClick={() => handleRead(manga.id)}
                        >
                          Continue Reading
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {pickerOpen && (
        <ChapterPicker
          mangaId={pickerOpen}
          onClose={() => setPickerOpen(null)}
        />
      )}
    </main>
  );
} 