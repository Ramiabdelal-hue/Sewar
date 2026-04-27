import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const rateMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || now > entry.resetTime) {
    rateMap.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }
  if (entry.count >= max) return true;
  entry.count++;
  return false;
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

// ─── Admin Token Verification (constant-time) ─────────────────────────────────
function isValidAdminToken(req: NextRequest): boolean {
  const token = req.headers.get('x-admin-token');
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret || !token || token.length !== secret.length) return false;
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ secret.charCodeAt(i);
  }
  return result === 0;
}

function jsonUnauthorized() {
  return new NextResponse(
    JSON.stringify({ success: false, message: 'Unauthorized' }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  );
}

function jsonTooMany(retryAfter = 60) {
  return new NextResponse(
    JSON.stringify({ success: false, message: 'Too many requests. Try again later.' }),
    {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) },
    }
  );
}

// ─── Security Headers ─────────────────────────────────────────────────────────
function addSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-DNS-Prefetch-Control', 'on');
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://translate.googleapis.com https://www.gstatic.com; img-src 'self' data: blob: https:; font-src 'self' data: https://www.gstatic.com; connect-src 'self' https: https://translate.googleapis.com https://translate-pa.googleapis.com; frame-src https://translate.google.com; frame-ancestors 'none';"
  );
  return res;
}

// ─── Main Proxy Function ──────────────────────────────────────────────────────
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getIp(request);
  const method = request.method;

  // 1. Block suspicious patterns (path traversal, basic injection hints)
  const suspiciousPatterns = [/\.\.\//g, /<script/gi, /union\s+select/gi, /drop\s+table/gi];
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(request.url)) {
      return new NextResponse(JSON.stringify({ success: false, message: 'Bad request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // 2. Strict rate limit on login (10 attempts / minute)
  if (pathname === '/api/login') {
    if (isRateLimited(`login:${ip}`, 10, 60_000)) return jsonTooMany(60);
  }

  // 3. Rate limit all API routes (60 req / minute per IP per path)
  if (pathname.startsWith('/api/')) {
    if (isRateLimited(`api:${ip}:${pathname}`, 60, 60_000)) return jsonTooMany(60);
  }

  // 4. Protect /api/admin/* — require admin token
  if (pathname.startsWith('/api/admin/')) {
    if (!isValidAdminToken(request)) return jsonUnauthorized();
  }

  // 5. Protect write operations on content APIs
  const writeProtected = [
    '/api/questions',
    '/api/lessons',
    '/api/upload',
    '/api/exam-questions',
    '/api/praktijk/questions',
    '/api/praktijk/lessons',
    '/api/users',
  ];
  const isWrite = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  if (isWrite && writeProtected.some((p) => pathname.startsWith(p))) {
    if (!isValidAdminToken(request)) return jsonUnauthorized();
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|webp|ico|mp4|webm|ogg|mp3|wav)).*)',
  ],
};
