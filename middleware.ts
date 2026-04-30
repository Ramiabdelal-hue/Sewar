/**
 * Next.js Middleware — حماية على مستوى التطبيق
 * يعمل على كل request قبل وصوله للـ page أو API
 */
import { NextRequest, NextResponse } from "next/server";

// المسارات التي تحتاج تسجيل دخول
const PROTECTED_PATHS = [
  "/theorie",
  "/examen",
  "/praktical",
  "/lessons",
  "/lesson",
  "/results",
  "/payment-success",
];

// المسارات العامة (لا تحتاج حماية)
const PUBLIC_PATHS = [
  "/",
  "/gratis",
  "/contact",
  "/pwa-start",
  "/api/login",
  "/api/subscribe",
  "/api/check-subscription",
  "/api/check-payment-status",
  "/api/registration-status",
  "/api/settings",
  "/api/free-content",
  "/api/activity",
  "/api/contact",
  "/api/translate",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // السماح لكل الـ static files والـ Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // السماح للمسارات العامة
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // حماية لوحة الأدمن — التحقق يتم داخل الصفحة نفسها (localStorage)
  // لا نعيد توجيه هنا لأن الأدمن يستخدم client-side auth
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // للمسارات المحمية — نضيف header يخبر الصفحة بالتحقق
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (isProtected) {
    // نضيف header للصفحة لتعرف أنها محمية
    const response = NextResponse.next();
    response.headers.set("x-protected-route", "1");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * تطبيق على كل المسارات ما عدا:
     * - _next/static
     * - _next/image
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
