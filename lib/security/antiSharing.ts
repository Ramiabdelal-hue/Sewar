/**
 * Anti-Sharing System
 * كشف مشاركة الحساب: نفس الحساب من IPs مختلفة في نفس الوقت
 */
import { prisma } from "@/lib/prisma";

// نافذة الكشف: 10 دقائق
const WINDOW_MS = 10 * 60 * 1000;
// الحد الأقصى لعدد IPs مختلفة في النافذة
const MAX_UNIQUE_IPS = 3;

export interface SharingCheckResult {
  suspicious: boolean;
  uniqueIPs: number;
  ips: string[];
}

/**
 * يتحقق إذا كان الحساب يُستخدم من IPs كثيرة في نفس الوقت
 */
export async function checkAccountSharing(userEmail: string): Promise<SharingCheckResult> {
  try {
    const since = new Date(Date.now() - WINDOW_MS);

    const recentLogs = await prisma.activityLog.findMany({
      where: {
        userEmail,
        eventType: "pageview",
        createdAt: { gte: since },
        ip: { not: null },
      },
      select: { ip: true },
    });

    const uniqueIPs = [...new Set(recentLogs.map((l) => l.ip).filter(Boolean))] as string[];

    return {
      suspicious: uniqueIPs.length >= MAX_UNIQUE_IPS,
      uniqueIPs: uniqueIPs.length,
      ips: uniqueIPs,
    };
  } catch {
    return { suspicious: false, uniqueIPs: 0, ips: [] };
  }
}

/**
 * يسجل محاولة مشاركة ويعلق الحساب تلقائياً إذا تجاوز الحد
 */
export async function handleSharingViolation(userEmail: string): Promise<boolean> {
  try {
    const check = await checkAccountSharing(userEmail);
    if (!check.suspicious) return false;

    // تعليق الحساب تلقائياً وإبطال الجلسة
    await prisma.user.updateMany({
      where: { email: userEmail, status: "active" },
      data: {
        status: "suspended",
        sessionToken: null,
      },
    });

    console.warn(`🚫 Auto-suspended (sharing): ${userEmail} — ${check.uniqueIPs} IPs: ${check.ips.join(", ")}`);
    return true;
  } catch {
    return false;
  }
}
