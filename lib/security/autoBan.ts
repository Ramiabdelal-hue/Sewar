/**
 * Smart Auto-Ban System
 * حظر تلقائي بناءً على سلوك المستخدم
 */
import { prisma } from "@/lib/prisma";
import { sendSuspensionEmail } from "@/lib/email";

export interface BanRule {
  name: string;
  check: (userEmail: string) => Promise<boolean>;
  reason: string;
}

// ── القواعد ──────────────────────────────────────────────────────────────────

/**
 * قاعدة 1: أكثر من 10 محاولات screenshot → حظر تلقائي
 */
async function tooManyScreenshots(userEmail: string): Promise<boolean> {
  const count = await prisma.activityLog.count({
    where: { userEmail, eventType: "screenshot_attempt" },
  });
  return count >= 10;
}

/**
 * قاعدة 2: أكثر من 3 IPs مختلفة في 10 دقائق → مشاركة حساب
 */
async function suspiciousIPActivity(userEmail: string): Promise<boolean> {
  const since = new Date(Date.now() - 10 * 60 * 1000);
  const logs = await prisma.activityLog.findMany({
    where: { userEmail, eventType: "pageview", createdAt: { gte: since }, ip: { not: null } },
    select: { ip: true },
  });
  const uniqueIPs = new Set(logs.map((l) => l.ip)).size;
  return uniqueIPs >= 3;
}

/**
 * قاعدة 3: أكثر من 200 pageview في ساعة → bot أو scraping
 */
async function tooManyPageviews(userEmail: string): Promise<boolean> {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const count = await prisma.activityLog.count({
    where: { userEmail, eventType: "pageview", createdAt: { gte: since } },
  });
  return count >= 200;
}

// ── قائمة القواعد ─────────────────────────────────────────────────────────────
const BAN_RULES: BanRule[] = [
  {
    name: "too_many_screenshots",
    check: tooManyScreenshots,
    reason: "تجاوز الحد المسموح من محاولات التقاط الشاشة (10+)",
  },
  {
    name: "account_sharing",
    check: suspiciousIPActivity,
    reason: "اكتشاف مشاركة الحساب مع أجهزة متعددة",
  },
  {
    name: "too_many_pageviews",
    check: tooManyPageviews,
    reason: "نشاط مشبوه — عدد زيارات مرتفع جداً",
  },
];

// ── الدالة الرئيسية ───────────────────────────────────────────────────────────

/**
 * يفحص المستخدم على كل القواعد ويحظره تلقائياً إذا انتهك أي منها
 * يُستدعى من activity API بعد كل pageview أو screenshot
 */
export async function runAutoBanCheck(userEmail: string): Promise<{
  banned: boolean;
  rule?: string;
  reason?: string;
}> {
  try {
    // لا نفحص المستخدمين المعلقين مسبقاً
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { status: true, name: true },
    });
    if (!user || user.status === "suspended") return { banned: false };

    for (const rule of BAN_RULES) {
      const violated = await rule.check(userEmail);
      if (violated) {
        // تعليق الحساب وإبطال الجلسة
        await prisma.user.update({
          where: { email: userEmail },
          data: { status: "suspended", sessionToken: null },
        });

        // إرسال إيميل إشعار
        try {
          await sendSuspensionEmail(userEmail, user.name, rule.reason);
        } catch {
          // لا نوقف العملية إذا فشل الإيميل
        }

        console.warn(`🚫 Auto-banned [${rule.name}]: ${userEmail} — ${rule.reason}`);

        return { banned: true, rule: rule.name, reason: rule.reason };
      }
    }

    return { banned: false };
  } catch (err) {
    console.error("runAutoBanCheck error:", err);
    return { banned: false };
  }
}
