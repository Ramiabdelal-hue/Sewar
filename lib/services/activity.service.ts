/**
 * Activity Service — Business Logic
 * تسجيل نشاط المستخدمين وإرسال التحذيرات
 */
import { prisma } from "@/lib/prisma";
import { sendScreenshotWarningEmail } from "@/lib/email";

const EMAIL_WARNING_THRESHOLD = 3;

export interface ActivityData {
  userEmail?: string | null;
  eventType: "pageview" | "screenshot_attempt" | "login" | "logout";
  page?: string | null;
  userAgent?: string | null;
  ip?: string | null;
}

export async function trackActivity(data: ActivityData): Promise<void> {
  await prisma.activityLog.create({
    data: {
      userEmail: data.userEmail || null,
      eventType: data.eventType,
      page: data.page ? String(data.page).slice(0, 200) : null,
      userAgent: data.userAgent ? String(data.userAgent).slice(0, 500) : null,
      ip: data.ip || null,
    },
  });

  // تحديث lastSeen
  if (data.userEmail) {
    await prisma.user
      .updateMany({
        where: { email: data.userEmail.toLowerCase().trim() },
        data: { lastSeen: new Date() },
      })
      .catch(() => {});
  }

  // إرسال تحذير عند محاولات Screenshot
  if (data.eventType === "screenshot_attempt" && data.userEmail) {
    await handleScreenshotWarning(data.userEmail);
  }
}

async function handleScreenshotWarning(userEmail: string): Promise<void> {
  try {
    const totalAttempts = await prisma.activityLog.count({
      where: { userEmail, eventType: "screenshot_attempt" },
    });

    if (totalAttempts >= EMAIL_WARNING_THRESHOLD && totalAttempts % EMAIL_WARNING_THRESHOLD === 0) {
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { name: true, email: true },
      });
      if (user) {
        await sendScreenshotWarningEmail(user.email, user.name, totalAttempts);
      }
    }
  } catch (err) {
    console.error("handleScreenshotWarning error:", err);
  }
}

export async function getActivityStats(since?: Date) {
  const where = since ? { createdAt: { gte: since } } : {};
  const [total, byType, recentLogs] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.groupBy({
      by: ["eventType"],
      _count: { eventType: true },
      where,
    }),
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return { total, byType, recentLogs };
}
