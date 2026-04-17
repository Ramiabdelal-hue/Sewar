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
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return NextResponse.json({ success: false, expired: true, message: "المستخدم غير موجود" });
    }

    // التحقق من session token - إذا تم تسجيل الدخول من مكان آخر
    if (sessionToken && user.sessionToken && user.sessionToken !== sessionToken) {
      return NextResponse.json({
        success: false,
        expired: false,
        sessionInvalid: true,
        message: "تم تسجيل الدخول من جهاز آخر. يرجى تسجيل الدخول مجدداً."
      });
    }

    const now = new Date();
    const expiryDate = new Date(user.expiryDate);
    const isActive = expiryDate > now;

    if (!isActive) {
      return NextResponse.json({ success: false, expired: true, message: "انتهت صلاحية اشتراكك", expiryDate: user.expiryDate });
    }

    return NextResponse.json({
      success: true, expired: false,
      user: {
        email: user.email, name: user.name, category: user.category,
        subscriptionType: user.subscriptionType || "theorie",
        examCategory: user.examCategory, expiryDate: user.expiryDate
      },
      subscriptions: await prisma.subscription.findMany({
        where: { userId: user.id, isActive: true, expiryDate: { gt: now } }
      })
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: "خطأ في التحقق من الاشتراك" }, { status: 500 });
  }
}
