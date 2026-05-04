import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendScreenshotWarningEmail, sendAutoSuspendEmail, sendAdminAlertEmail } from "@/lib/email";
import { verifyAdminToken, unauthorizedResponse, checkRateLimit, getClientIp, isValidEmail } from "@/lib/adminAuth";
import { runAutoBanCheck } from "@/lib/security/autoBan";

// الحد: إرسال إيميل تحذير عند المحاولة رقم 3
const EMAIL_WARNING_THRESHOLD = 3;
// الحد: تعليق تلقائي عند المحاولة رقم 6
const AUTO_SUSPEND_THRESHOLD = 6;

// POST - تسجيل نشاط
export async function POST(request: NextRequest) {
  // Rate limit: max 30 activity logs per minute per IP
  const ip = getClientIp(request);
  if (!checkRateLimit(ip, 30, 60000)) {
    return NextResponse.json({ success: false }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { userEmail, eventType, page } = body;

    // Validate eventType whitelist
    const allowedEvents = ["pageview", "screenshot_attempt", "login", "logout"];
    if (!eventType || !allowedEvents.includes(eventType)) {
      return NextResponse.json({ success: false, message: "Invalid event type" }, { status: 400 });
    }

    // Validate email if provided
    if (userEmail && !isValidEmail(userEmail)) {
      return NextResponse.json({ success: false, message: "Invalid email" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") || "";

    await prisma.activityLog.create({
      data: {
        userEmail: userEmail || null,
        eventType,
        page: page ? String(page).slice(0, 200) : null,
        userAgent: userAgent.slice(0, 500),
        ip,
      },
    });

    // تحديث lastSeen للمستخدم المسجل
    if (userEmail && isValidEmail(userEmail)) {
      await prisma.user.updateMany({
        where: { email: userEmail.toLowerCase().trim() },
        data: { lastSeen: new Date() },
      }).catch(() => {});
    }

    // ── Auto-Ban Check (بعد كل نشاط للمستخدمين المسجلين) ────────────────────
    if (userEmail && isValidEmail(userEmail)) {
      // نشغّله في الخلفية بدون انتظار حتى لا يبطئ الـ response
      runAutoBanCheck(userEmail).catch(() => {});
    }

    // ── إرسال إيميل تحذيري تلقائياً ─────────────────────────────────────────
    if (eventType === "screenshot_attempt" && userEmail) {
      const totalAttempts = await prisma.activityLog.count({
        where: { userEmail, eventType: "screenshot_attempt" },
      });

      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { name: true, email: true, status: true, phone: true },
      });

      // ── تعليق تلقائي عند 6+ محاولات ─────────────────────────────────────
      if (totalAttempts >= AUTO_SUSPEND_THRESHOLD && user && user.status !== "suspended") {
        // تعليق الحساب فوراً + إلغاء الـ session
        await prisma.user.update({
          where: { email: userEmail },
          data: { status: "suspended", sessionToken: null },
        });
        // إرسال إيميل التعليق للمشترك + تنبيه الأدمن بالتوازي
        try {
          await Promise.allSettled([
            sendAutoSuspendEmail(user.email, user.name, totalAttempts),
            sendAdminAlertEmail({
              userName: user.name,
              userEmail: user.email,
              userPhone: user.phone || null,
              attemptCount: totalAttempts,
              page: page ? String(page) : "/",
            }),
          ]);
          console.log(`🔒 Auto-suspended ${userEmail} after ${totalAttempts} screenshot attempts`);
        } catch (e: any) {
          console.error(`❌ Auto-suspend emails failed: ${e.message}`);
        }
        return NextResponse.json({ success: true, totalAttempts, autoSuspended: true });
      }

      // ── إرسال إيميل تحذير عند 3 محاولات ─────────────────────────────────
      if (totalAttempts === EMAIL_WARNING_THRESHOLD && user) {
        try {
          const result = await sendScreenshotWarningEmail(user.email, user.name, totalAttempts);
          if (result.success) {
            console.log(`📧 Warning email sent to ${user.email} (${totalAttempts} attempts)`);
          } else {
            console.error(`❌ Warning email FAILED for ${user.email}: ${result.error}`);
          }
        } catch (emailErr: any) {
          console.error(`❌ Email exception for ${user.email}:`, emailErr.message);
        }
      }

      // إرجاع العدد الكلي للفرونت لإظهار التحذير
      return NextResponse.json({ success: true, totalAttempts });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// GET - جلب الإحصائيات للأدمن فقط
export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) return unauthorizedResponse();
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
