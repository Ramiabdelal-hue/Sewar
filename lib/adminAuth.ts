import { NextRequest, NextResponse } from "next/server";

/**
 * التحقق من صلاحية الأدمن عبر header سري
 * يُستخدم في API routes الإدارية
 */
export function verifyAdminToken(request: NextRequest): boolean {
  const token = request.headers.get("x-admin-token");
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret || !token) return false;
  // Constant-time comparison to prevent timing attacks
  if (token.length !== secret.length) return false;
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ secret.charCodeAt(i);
  }
  return result === 0;
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

/**
 * Sanitize string input — strip dangerous characters
 */
export function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, maxLength).replace(/[<>]/g, "");
}

/**
 * Validate email format
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

/**
 * إرسال طلب check-subscription مع session token
 * يُستخدم في كل الصفحات للتحقق من الجلسة
 */
export async function checkSubscriptionWithSession(email: string): Promise<{
  success: boolean;
  expired?: boolean;
  sessionInvalid?: boolean;
  message?: string;
  user?: any;
  subscriptions?: any[];
}> {
  const sessionToken = typeof window !== "undefined" ? localStorage.getItem("sessionToken") || undefined : undefined;
  try {
    const res = await fetch("/api/check-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, sessionToken }),
    });
    if (!res.ok) return { success: false };
    return await res.json();
  } catch {
    return { success: false };
  }
}

/**
 * تسجيل الخروج وحذف بيانات الجلسة
 */
export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userCategory");
    localStorage.removeItem("userExpiry");
    localStorage.removeItem("sessionToken");
  }
}
