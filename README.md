# Manga Reader

A modern, full-featured manga reader web app built with Next.js and React. Browse, search, and read manga with a beautiful, dark-themed interface. Favorite your manga, pick chapters, and enjoy a seamless reading experience.

## Features
- Browse and search manga with filters (title, genres, etc.)
- Read manga chapters in vertical or horizontal mode
- Favorite manga and access them in a dedicated tab
- Persistent favorites using localStorage
- Chapter picker for quick navigation
- Responsive, accessible, and modern UI
- Uses the [MangaDex API](https://api.mangadex.org/) for manga data and images

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/manga-reader.git
   cd manga-reader
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the App Locally

Start the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use the app.

## API Usage
This project uses the public [MangaDex API](https://api.mangadex.org/) to fetch manga, chapters, covers, and genres. No API key is required for public endpoints.

## Configuration
If you add new image sources, update `next.config.js` to allow their domains for Next.js image optimization.

## License
MIT
