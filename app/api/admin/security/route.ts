/**
 * Admin Security Dashboard API
 * إحصائيات الأمان: مشاركة الحسابات، محاولات Screenshot، الحظر التلقائي
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, unauthorizedResponse, getClientIp } from "@/lib/adminAuth";
import { checkAccountSharing } from "@/lib/security/antiSharing";

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) return unauthorizedResponse();

  try {
    const since10min = new Date(Date.now() - 10 * 60 * 1000);
    const since1h    = new Date(Date.now() - 60 * 60 * 1000);
    const since24h   = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // المستخدمون المعلقون
    const suspendedUsers = await prisma.user.findMany({
      where: { status: "suspended" },
      select: { id: true, name: true, email: true, lastSeen: true },
      orderBy: { lastSeen: "desc" },
    });

    // أكثر المستخدمين محاولات screenshot
    const screenshotStats = await prisma.activityLog.groupBy({
      by: ["userEmail"],
      where: { eventType: "screenshot_attempt", userEmail: { not: null } },
      _count: { eventType: true },
      orderBy: { _count: { eventType: "desc" } },
      take: 20,
    });

    // المستخدمون النشطون الآن (آخر 10 دقائق)
    const activeNow = await prisma.user.findMany({
      where: { lastSeen: { gte: since10min } },
      select: { email: true, name: true, lastSeen: true },
      orderBy: { lastSeen: "desc" },
    });

    // كشف مشاركة الحسابات — فحص المستخدمين النشطين
    const sharingAlerts: { email: string; uniqueIPs: number; ips: string[] }[] = [];
    for (const u of activeNow.slice(0, 50)) {
      const check = await checkAccountSharing(u.email);
      if (check.suspicious) {
        sharingAlerts.push({ email: u.email, uniqueIPs: check.uniqueIPs, ips: check.ips });
      }
    }

    // إحصائيات عامة
    const [totalPageviews1h, totalScreenshots24h, loginAttempts1h] = await Promise.all([
      prisma.activityLog.count({ where: { eventType: "pageview", createdAt: { gte: since1h } } }),
      prisma.activityLog.count({ where: { eventType: "screenshot_attempt", createdAt: { gte: since24h } } }),
      prisma.activityLog.count({ where: { eventType: "login", createdAt: { gte: since1h } } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        suspendedUsers,
        screenshotStats: screenshotStats.map((s) => ({
          email: s.userEmail,
          count: s._count.eventType,
        })),
        activeNow: activeNow.length,
        sharingAlerts,
        stats: {
          totalPageviews1h,
          totalScreenshots24h,
          loginAttempts1h,
          suspendedCount: suspendedUsers.length,
          sharingAlertsCount: sharingAlerts.length,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/admin/security:", error);
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}
