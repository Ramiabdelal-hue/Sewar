import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendScreenshotWarningEmail } from "@/lib/email";
import { verifyAdminToken, unauthorizedResponse } from "@/lib/adminAuth";

// POST - إرسال إيميل تحذيري يدوياً من لوحة الأدمن
export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) return unauthorizedResponse();
  try {
    const body = await request.json();
    const { userEmail } = body;

    if (!userEmail) {
      return NextResponse.json({ success: false, message: "userEmail مطلوب" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
    }

    const totalAttempts = await prisma.activityLog.count({
      where: { userEmail, eventType: "screenshot_attempt" },
    });

    const result = await sendScreenshotWarningEmail(user.email, user.name, totalAttempts);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `تم إرسال إيميل تحذيري إلى ${user.name} (${user.email})`,
      });
    } else {
      return NextResponse.json(
        { success: false, message: `فشل إرسال الإيميل: ${result.error}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error sending warning email:", error);
    return NextResponse.json({ success: false, message: "خطأ في الخادم" }, { status: 500 });
  }
}
