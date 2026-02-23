import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * API للتحقق من حالة الدفع
 * يتحقق إذا تم استلام webhook من بوابة الدفع
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        paid: false,
        message: "User not found",
      });
    }

    // التحقق من صلاحية الاشتراك
    const now = new Date();
    const expiryDate = new Date(user.expiryDate);
    
    // إذا كان الاشتراك نشطاً (لم ينتهي بعد)
    if (expiryDate > now && user.status === "active") {
      return NextResponse.json({
        success: true,
        paid: true,
        subscription: {
          type: user.subscriptionType,
          category: user.category,
          expiryDate: user.expiryDate,
        },
      });
    }

    // لم يتم الدفع بعد
    return NextResponse.json({
      success: true,
      paid: false,
      message: "Payment not confirmed yet",
    });
  } catch (error) {
    console.error("❌ Error checking payment status:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
