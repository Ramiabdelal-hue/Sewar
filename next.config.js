/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  compress: true,
  poweredByHeader: false,

  // تحسين الأداء
  experimental: {
    optimizePackageImports: ["react-icons"],
  },

  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // cache الصور لمدة 7 أيام في Next.js image optimizer
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      { protocol: 'https', hostname: 'www.gratisrijbewijsonline.be' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // cache الصور الثابتة في public/
      {
        source: '/:file(.*\\.(?:jpg|jpeg|png|gif|webp|svg|ico|avif))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      // cache للـ API responses - GET فقط
      {
        source: '/api/settings',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' },
        ],
      },
      // لا نضع CDN cache على exam-questions أو free-content لأن المحتوى يتغير
      // Next.js unstable_cache يتولى الـ caching داخلياً
    ];
  },
};

module.exports = nextConfig;
