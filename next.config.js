/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uploads.mangadex.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mangaplus.shueisha.co.jp',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig 