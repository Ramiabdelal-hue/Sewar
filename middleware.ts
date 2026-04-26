import { NextRequest, NextResponse } from "next/server";

// ─── Security Headers ────────────────────────────────────────────────────────
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  );
  return response;
}

// ─── Rate Limiting (in-memory) ───────────────────────────────────────────────
const rateMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (entry.count >= max) return true;
  entry.count++;
  return false;
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// ─── Admin Token Verification ────────────────────────────────────────────────
function isValidAdminToken(req: NextRequest): boolean {
  const token = req.headers.get("x-admin-token");
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret || !token) return false;
  return token === secret;
}

// ─── Main Middleware ─────────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getIp(request);

  // ── 1. Block /admin pages without admin cookie ───────────────────────────
  if (pathname.startsWith("/admin")) {
    const adminSession = request.cookies.get("admin_session")?.value;
    const secret = process.env.ADMIN_API_SECRET;
    if (!adminSession || !secret || adminSession !== secret) {
      // Allow the admin page itself to load (login happens client-side)
      // but block direct API abuse via middleware
    }
  }

  // ── 2. Rate limit login endpoint (strict) ───────────────────────────────
  if (pathname === "/api/login") {
    if (isRateLimited(`login:${ip}`, 10, 60_000)) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Too many login attempts. Try again in 1 minute." }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
      );
    }
  }

  // ── 3. Rate limit all API routes ────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    if (isRateLimited(`api:${ip}:${pathname}`, 60, 60_000)) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Too many requests. Try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
      );
    }
  }

  // ── 4. Protect /api/admin/* — require admin token ───────────────────────
  if (pathname.startsWith("/api/admin/")) {
    if (!isValidAdminToken(request)) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // ── 5. Protect write operations on questions/lessons/upload ─────────────
  const writeProtectedPaths = ["/api/questions", "/api/lessons", "/api/upload", "/api/praktijk/questions", "/api/praktijk/lessons"];
  const isWriteMethod = ["POST", "PUT", "DELETE", "PATCH"].includes(request.method);
  if (isWriteMethod && writeProtectedPaths.some((p) => pathname.startsWith(p))) {
    if (!isValidAdminToken(request)) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // ── 6. Block suspicious patterns (path traversal, SQL injection hints) ──
  const suspiciousPatterns = [/\.\.\//g, /<script/gi, /union\s+select/gi, /drop\s+table/gi];
  const fullUrl = request.url;
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fullUrl)) {
      return new NextResponse(JSON.stringify({ success: false, message: "Bad request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
  ],
};
