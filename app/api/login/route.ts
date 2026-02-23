import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  // 🔹 حالة خاصة (rami / 123)
  if (email === "rami@gmail.com" && password === "123") {
    return NextResponse.json({
      success: true,
      role: "admin", // ← هذا يفتح صفحة إدخال الدروس
      email: "rami",
    });
  }

  // 🔹 البحث عن المستخدم في قاعدة البيانات
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      subscriptions: {
        where: {
          isActive: true,
          expiryDate: {
            gt: new Date() // فقط الاشتراكات النشطة
          }
        }
      }
    }
  });

  // 🔹 التحقق من كلمة المرور
  if (user && user.password === password) {
    // جمع جميع الاشتراكات النشطة
    const activeSubscriptions = user.subscriptions.map(sub => ({
      type: sub.subscriptionType,
      category: sub.category,
      examCategory: sub.examCategory,
      expiryDate: sub.expiryDate.getTime()
    }));

    // استخدام الفئة من أول اشتراك نشط (أو الفئة القديمة كـ fallback)
    const primaryCategory = activeSubscriptions.length > 0 
      ? activeSubscriptions[0].category 
      : user.category;

    return NextResponse.json({
      success: true,
      role: "student",
      cat: primaryCategory, // استخدام الفئة من الاشتراك النشط
      email: user.email,
      subscriptionType: user.subscriptionType || "theorie",
      examCategory: user.examCategory,
      exp: user.expiryDate.getTime(),
      subscriptions: activeSubscriptions // جميع الاشتراكات النشطة
    });
  }

  return NextResponse.json({
    success: false,
    message: "Invalid credentials",
  });
}
