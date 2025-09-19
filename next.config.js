/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enables React's Strict Mode for production warnings
  compress: true, // Enables gzip compression for responses
  images: {
    domains: ['res.cloudinary.com'], // Existing
    formats: ['image/avif', 'image/webp'], // Optimize image formats
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
