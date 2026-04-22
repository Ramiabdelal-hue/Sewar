import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - تسجيل نشاط
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, eventType, page } = body;

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    const userAgent = request.headers.get("user-agent") || "";

    await prisma.activityLog.create({
      data: {
        userEmail: userEmail || null,
        eventType,
        page: page || null,
        userAgent,
        ip,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// GET - جلب الإحصائيات للأدمن
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // زوار اليوم (IPs فريدة)
    const todayLogs = await prisma.activityLog.findMany({
      where: { createdAt: { gte: today }, eventType: "pageview" },
      select: { ip: true, userEmail: true },
    });
    const todayUniqueIPs = new Set(todayLogs.map(l => l.ip)).size;
    const todayLoggedIn = new Set(todayLogs.filter(l => l.userEmail).map(l => l.userEmail)).size;

    // زوار آخر 7 أيام
    const week7Logs = await prisma.activityLog.findMany({
      where: { createdAt: { gte: last7days }, eventType: "pageview" },
      select: { ip: true },
    });
    const weekUniqueIPs = new Set(week7Logs.map(l => l.ip)).size;

    // محاولات screenshot
    const screenshotAttempts = await prisma.activityLog.findMany({
      where: { eventType: "screenshot_attempt", createdAt: { gte: last30days } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // أكثر الصفحات زيارة
    const allPageviews = await prisma.activityLog.findMany({
      where: { eventType: "pageview", createdAt: { gte: last7days } },
      select: { page: true },
    });
    const pageCount: Record<string, number> = {};
    allPageviews.forEach(l => {
      if (l.page) pageCount[l.page] = (pageCount[l.page] || 0) + 1;
    });
    const topPages = Object.entries(pageCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));

    // آخر النشاطات
    const recentActivity = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    // إجمالي الزوار الفريدين (كل الوقت)
    const allIPs = await prisma.activityLog.findMany({
      where: { eventType: "pageview" },
      select: { ip: true },
      distinct: ["ip"],
    });

    return NextResponse.json({
      success: true,
      stats: {
        todayVisitors: todayUniqueIPs,
        todayLoggedIn,
        weekVisitors: weekUniqueIPs,
        totalUniqueVisitors: allIPs.length,
        screenshotAttempts: screenshotAttempts.length,
        topPages,
        recentActivity,
        recentScreenshots: screenshotAttempts,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
