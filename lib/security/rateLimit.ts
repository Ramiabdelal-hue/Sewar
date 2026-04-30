/**
 * Rate Limiting — in-memory per IP
 * للإنتاج استخدم Redis بدلاً من Map
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// تنظيف الـ entries القديمة كل 5 دقائق
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (now > entry.resetAt) store.delete(key);
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * التحقق من rate limit لـ IP معين
 * @param key - عادةً IP أو IP:endpoint
 * @param maxRequests - الحد الأقصى للطلبات
 * @param windowMs - النافذة الزمنية بالميلي ثانية
 */
export function rateLimit(
  key: string,
  maxRequests = 10,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

/**
 * Presets جاهزة للاستخدام
 */
export const rateLimits = {
  login:    (ip: string) => rateLimit(`login:${ip}`,    10,  60_000),   // 10/min
  api:      (ip: string) => rateLimit(`api:${ip}`,      60,  60_000),   // 60/min
  upload:   (ip: string) => rateLimit(`upload:${ip}`,   20,  60_000),   // 20/min
  activity: (ip: string) => rateLimit(`activity:${ip}`, 30,  60_000),   // 30/min
  subscribe:(ip: string) => rateLimit(`subscribe:${ip}`, 5, 600_000),   // 5/10min
};
