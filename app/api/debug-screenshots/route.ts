import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, unauthorizedResponse } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) return unauthorizedResponse();
  
  try {
    // جلب جميع screenshot_attempts
    const screenshots = await prisma.activityLog.findMany({
      where: { eventType: "screenshot_attempt" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // جلب جميع أنواع الأحداث الموجودة
    const eventTypes = await prisma.activityLog.groupBy({
      by: ["eventType"],
      _count: { eventType: true },
    });

    // إجمالي السجلات
    const total = await prisma.activityLog.count();

    return NextResponse.json({
      total,
      eventTypes,
      screenshotCount: screenshots.length,
      screenshots: screenshots.map(s => ({
        id: s.id,
        userEmail: s.userEmail,
        page: s.page,
        ip: s.ip,
        createdAt: s.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
