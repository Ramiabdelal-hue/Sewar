import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuspensionEmail } from "@/lib/email";
import { verifyAdminToken, unauthorizedResponse } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) return unauthorizedResponse();
  try {
    const body = await request.json();
    const { userEmail, action, reason } = body;

    if (!userEmail || !action) {
      return NextResponse.json({ success: false, message: "userEmail و action مطلوبان" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, name: true, email: true, status: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
    }

    if (action === "suspend") {
      await prisma.user.update({
        where: { email: userEmail },
        data: { status: "suspended", sessionToken: null },
      });

      // إرسال إيميل - await لنرى الخطأ إن وجد
      let emailStatus = "not_sent";
      try {
        const emailResult = await sendSuspensionEmail(user.email, user.name, reason || "");
        emailStatus = emailResult.success ? "sent" : `failed: ${emailResult.error}`;
        console.log(`📧 Suspension email for ${user.email}: ${emailStatus}`);
      } catch (emailErr: any) {
        emailStatus = `exception: ${emailErr.message}`;
        console.error(`❌ Suspension email exception for ${user.email}:`, emailErr.message);
      }

      return NextResponse.json({
        success: true,
        message: `تم تعليق اشتراك ${user.name} مؤقتاً`,
        emailStatus,
        newStatus: "suspended",
      });
    }

    if (action === "unsuspend") {
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

    return NextResponse.json({ success: false, message: "action غير صالح" }, { status: 400 });
  } catch (error: any) {
    console.error("Error suspending user:", error);
    return NextResponse.json({ success: false, message: `خطأ في الخادم: ${error.message}` }, { status: 500 });
  }
}
