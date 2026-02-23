import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting map (في الإنتاج، استخدم Redis)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

// تنظيف الـ rate limit map كل 10 دقائق
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimit.entries()) {
    if (now > value.resetTime) {
      rateLimit.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // إضافة Security Headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // Rate Limiting للـ API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 دقيقة
    const maxRequests = 100; // 100 طلب في الدقيقة

    const rateLimitKey = `${ip}-${request.nextUrl.pathname}`;
    const rateLimitData = rateLimit.get(rateLimitKey);

    if (rateLimitData) {
      if (now < rateLimitData.resetTime) {
        if (rateLimitData.count >= maxRequests) {
          return new NextResponse(
            JSON.stringify({
              success: false,
              message: 'عدد كبير من الطلبات. يرجى المحاولة لاحقاً.'
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': String(Math.ceil((rateLimitData.resetTime - now) / 1000))
              }
            }
          );
        }
        rateLimitData.count++;
      } else {
        rateLimit.set(rateLimitKey, { count: 1, resetTime: now + windowMs });
      }
    } else {
      rateLimit.set(rateLimitKey, { count: 1, resetTime: now + windowMs });
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, videos, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|webp|ico|mp4|webm|ogg|mp3|wav)).*)',
  ],
};
