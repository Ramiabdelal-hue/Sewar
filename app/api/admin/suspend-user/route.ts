import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuspensionEmail } from "@/lib/email";

// POST - تعليق أو رفع تعليق اشتراك مستخدم
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, action, reason } = body;
    // action: "suspend" | "unsuspend"

    if (!userEmail || !action) {
      return NextResponse.json(
        { success: false, message: "userEmail و action مطلوبان" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, name: true, email: true, status: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    if (action === "suspend") {
      // تعليق: تغيير status إلى "suspended" وإبطال الـ session token
      await prisma.user.update({
        where: { email: userEmail },
        data: {
          status: "suspended",
          sessionToken: null, // إجبار المستخدم على تسجيل الخروج فوراً
        },
      });

      // إرسال إيميل إشعار للمستخدم في الخلفية
      sendSuspensionEmail(
        user.email,
        user.name,
        reason || ""
      ).catch(console.error);

      return NextResponse.json({
        success: true,
        message: `تم تعليق اشتراك ${user.name} مؤقتاً`,
        newStatus: "suspended",
      });
    }

    if (action === "unsuspend") {
      // رفع التعليق: إعادة status إلى "active"
      await prisma.user.update({
        where: { email: userEmail },
        data: { status: "active" },
      });

      return NextResponse.json({
        success: true,
        message: `تم رفع تعليق اشتراك ${user.name}`,
        newStatus: "active",
      });
    }

    return NextResponse.json(
      { success: false, message: "action غير صالح. استخدم suspend أو unsuspend" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error suspending user:", error);
    return NextResponse.json({ success: false, message: "خطأ في الخادم" }, { status: 500 });
  }
}
