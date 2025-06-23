# Manga Reader

A modern manga reading web application built with Next.js 15, React, and TypeScript. Features a glassmorphism design, advanced filtering, and seamless reading experience.

## Live Site

**[Visit Manga Reader](https://manga-reader-rose.vercel.app/)**

## Features

### Modern Design
- Glassmorphism UI with gradient backgrounds and backdrop blur effects
- Dark theme optimized for comfortable reading
- Responsive design that works on all devices
- Smooth animations and hover effects

### Reading Experience
- Chapter picker with intuitive navigation
- High-quality image loading with Next.js Image optimization
- Page-by-page reading with smooth transitions
- Chapter navigation (previous/next) with keyboard shortcuts
- Automatic chapter filtering - only shows manga with available English chapters

### Discovery & Search
- Advanced search by title with real-time results
- Genre filtering with multi-select dropdown
- Featured manga curated selection on homepage
- Smart filtering excludes manga without readable content
- Persistent genre preferences saved in localStorage

### Personal Collection
- Favorites system to save your favorite manga
- Persistent storage using localStorage
- Beautiful favorites page with collection stats
- One-click favoriting from any manga card

### Performance
- Server-side rendering with Next.js App Router
- Optimized API routes with retry logic and error handling
- Image optimization with Next.js Image component
- Fast loading with efficient data fetching
- Mobile-optimized for reading on any device

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom React components
- **Data Source:** MangaDex API
- **Deployment:** Vercel
- **State Management:** React Hooks + localStorage
- **Image Optimization:** Next.js Image

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Prattyush15/manga-reader.git
   cd manga-reader
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser:
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── manga/         # Manga-related endpoints
│   │   └── manga/         # Manga-related endpoints
│   ├── browse/            # Browse page
│   ├── favorites/         # Favorites page
│   ├── read/              # Chapter reading page
│   └── page.tsx           # Homepage
├── components/            # Reusable React components
│   ├── MangaCard.tsx      # Manga display card
│   ├── ChapterPicker.tsx  # Chapter selection modal
│   ├── FavoriteButton.tsx # Favorite toggle button
│   └── ...
├── hooks/                 # Custom React hooks
│   └── useFavorites.ts    # Favorites management
├── services/              # External API services
│   └── mangaService.ts    # MangaDex API integration
└── types/                 # TypeScript type definitions
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/manga` | Search and filter manga |
| `/api/manga/featured` | Get featured manga |
| `/api/manga/tags` | Get available genres |
| `/api/manga/[id]/chapters` | Get chapters for a manga |

## API Integration

This app uses the **MangaDex API** to fetch:
- Manga metadata and covers
- Chapter information and pages
- Genre tags and filtering options
- Search results and featured content

No API key required, it uses public endpoints with proper rate limiting and error handling.



   
