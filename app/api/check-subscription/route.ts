import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, sessionToken } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: "البريد الإلكتروني مطلوب" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        subscriptions: {
          where: { isActive: true, expiryDate: { gt: new Date() } },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, expired: true, message: "المستخدم غير موجود" });
    }

    // التحقق من session token إذا أُرسل
    if (sessionToken && user.sessionToken && user.sessionToken !== sessionToken) {
      return NextResponse.json({ success: false, sessionInvalid: true, message: "انتهت الجلسة" });
    }

    // ── التحقق من التعليق المؤقت ──────────────────────────────────────────
    if (user.status === "suspended") {
      return NextResponse.json({
        success: false,
        suspended: true,
        message: "تم تعليق اشتراكك مؤقتاً من قِبل المشرف. تواصل معنا على sewarrijbewijs@gmail.com",
      });
    }

    const now = new Date();
    const expiryDate = new Date(user.expiryDate);
    const isActive = expiryDate > now;

    if (!isActive) {
      return NextResponse.json({
        success: false,
        expired: true,
        message: "انتهت صلاحية اشتراكك",
        expiryDate: user.expiryDate,
      });
    }

    // عدد محاولات Screenshot لهذا المستخدم
    const screenshotAttempts = await prisma.activityLog.count({
      where: { userEmail: email, eventType: "screenshot_attempt" },
    });

    const subscriptions = user.subscriptions;

    return NextResponse.json({
      success: true,
      expired: false,
      suspended: false,
      screenshotAttempts,
      user: {
        email: user.email,
        name: user.name,
        category: user.category,
        subscriptionType: user.subscriptionType || "theorie",
        examCategory: user.examCategory,
        expiryDate: user.expiryDate,
      },
      subscriptions,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "خطأ في التحقق من الاشتراك" }, { status: 500 });
  }
}
