# Manga Reader

Welcome to **Manga Reader**, a modern web app built with **Next.js** and **React** for reading manga online—completely ad-free. Search, explore, and read chapters with a smooth, dark-themed interface designed for manga fans.

## Features

- Search and filter manga by title, genre, and more
- Read chapters in vertical or horizontal mode
- Favorite manga and access them anytime
- Favorites are saved in your browser using localStorage
- Quick chapter picker for easy navigation
- Fully responsive design for desktop and mobile
- Dark mode interface for comfortable reading
- Uses the public [MangaDex API](https://api.mangadex.org/) to fetch data

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/manga-reader.git
   cd manga-reader

2. Install the dependencies:
   
   ```bash
   npm install
   # or
   yarn install

3. Running the App Locally
   Start the development server: 
   ```bash
   npm run dev
   

## API Usage
This project uses the public MangaDex API to fetch manga information, chapters, covers, and genres. No API key is required to access the public endpoints.

## Configuration
If you add new image sources, update next.config.js to include their domains so that Next.js can properly optimize and serve the images.



   
