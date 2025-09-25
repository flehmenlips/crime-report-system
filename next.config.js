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
  // PWA Configuration
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/offline.html',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },
  // Enable experimental features for better PWA support
  experimental: {
    // optimizeCss: true, // Disabled due to critters compatibility issues
  },
  // Disable build ID generation to use default chunk naming
  // generateBuildId: async () => {
  //   return 'build-' + Date.now() + '-fixed'
  // },
}

module.exports = nextConfig
