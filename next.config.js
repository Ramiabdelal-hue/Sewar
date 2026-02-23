/** @type {import('next').NextConfig} */
const nextConfig = {
  // تجاهل أخطاء TypeScript و ESLint أثناء البناء
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  experimental: {
    serverActions: {
      allowedOrigins: ["192.168.1.6:3000", "localhost:3000"],
    },
  },
  
  // تحسينات الأداء
  compress: true, // تفعيل ضغط gzip
  
  // تحسين الصور
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Headers للأمان والأداء
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // إعدادات الإنتاج
  poweredByHeader: false, // إخفاء X-Powered-By header
  reactStrictMode: true,
};

module.exports = nextConfig;

