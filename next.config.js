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
  // PWA Configuration with aggressive cache busting for chunks
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
            value: 'public, max-age=0, must-revalidate',
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
      {
        source: '/_next/static/:path*',
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
  // Disable custom build ID generation to use Next.js default behavior
  // generateBuildId: async () => {
  //   return 'fix-chunks-v2-' + Math.random().toString(36).substring(7) + '-' + Date.now()
  // },
  
  // Performance optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Reduce bundle size by splitting vendor chunks
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }
    return config
  },
}

module.exports = nextConfig
