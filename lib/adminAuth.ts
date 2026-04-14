import { NextRequest, NextResponse } from "next/server";

/**
 * التحقق من صلاحية الأدمن عبر header سري
 * يُستخدم في API routes الإدارية
 */
export function verifyAdminToken(request: NextRequest): boolean {
  const token = request.headers.get("x-admin-token");
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret || !token) return false;
  return token === secret;
}

export function unauthorizedResponse() {
  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
}

/**
 * التحقق من بيانات الأدمن (username/password)
 */
export function verifyAdminCredentials(username: string, password: string): boolean {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminUser || !adminPass) return false;
  return username === adminUser && password === adminPass;
}

/**
 * Rate limiting بسيط في الذاكرة
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

export function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
}
