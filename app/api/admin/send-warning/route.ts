import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendScreenshotWarningSMS } from "@/lib/sms";

// POST - إرسال SMS تحذيري يدوياً من لوحة الأدمن
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail } = body;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: "userEmail مطلوب" },
        { status: 400 }
      );
    }

    // جلب بيانات المستخدم
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { name: true, phone: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    if (!user.phone) {
      return NextResponse.json(
        { success: false, message: "لا يوجد رقم هاتف لهذا المستخدم" },
        { status: 400 }
      );
    }

    // عد إجمالي المحاولات
    const totalAttempts = await prisma.activityLog.count({
      where: {
        userEmail,
        eventType: "screenshot_attempt",
      },
    });

    // إرسال SMS
    const result = await sendScreenshotWarningSMS(
      user.phone,
      user.name,
      totalAttempts
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `تم إرسال SMS تحذيري إلى ${user.name} (${user.phone})`,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: `فشل إرسال SMS: ${result.error}`,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error sending warning SMS:", error);
    return NextResponse.json(
      { success: false, message: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
