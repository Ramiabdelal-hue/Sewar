// app/api/subscribe/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1️⃣ قراءة بيانات الطلب
    const body = await req.json();
    console.log("📥 Received request:", { 
      email: body.email, 
      category: body.category,
      subscriptionType: body.subscriptionType,
      forceRenew: body.forceRenew 
    });

    // 2️⃣ توحيد البريد إلى lowercase
    const emailNormalized = body.email.toLowerCase().trim();

    // 3️⃣ التحقق من وجود المستخدم مسبقاً
    const existingUser = await prisma.user.findUnique({
      where: { email: emailNormalized }
    });

    console.log("🔍 Existing user check:", {
      exists: !!existingUser,
      email: emailNormalized,
      forceRenew: body.forceRenew,
      expiryDate: existingUser?.expiryDate,
    });

    // 4️⃣ التحقق من وجود اشتراك مماثل نشط
    if (existingUser && !body.forceRenew) {
      // التحقق من وجود اشتراك مماثل (نفس النوع ونفس الفئة)
      const existingSubscription = await prisma.subscription.findUnique({
        where: {
          userId_subscriptionType_category: {
            userId: existingUser.id,
            subscriptionType: body.subscriptionType || "theorie",
            category: body.category || "B"
          }
        }
      });

      if (existingSubscription) {
        const now = new Date();
        const expiryDate = new Date(existingSubscription.expiryDate);
        const isActive = expiryDate > now;

        if (isActive) {
          // التحقق: هل يحاول الاشتراك في نفس الفئة والخدمة؟
          const isSameSubscription = 
            existingSubscription.subscriptionType === (body.subscriptionType || "theorie") &&
            existingSubscription.category === (body.category || "B");

          if (isSameSubscription) {
            // ممنوع الاشتراك في نفس الفئة والخدمة مرة أخرى
            console.log("❌ User trying to subscribe to same category and service");
            return NextResponse.json({
              success: false,
              message: "لديك بالفعل اشتراك نشط في هذه الفئة والخدمة! يمكنك الاشتراك في فئة أو خدمة أخرى.",
              alreadySubscribed: true,
              email: existingUser.email,
              cat: body.category,
              subscriptionType: body.subscriptionType,
              exp: existingSubscription.expiryDate.getTime(),
            });
          }
          
          // إذا كان يحاول الاشتراك في خدمة أخرى أو فئة أخرى، فهذا مسموح
          console.log("✅ User subscribing to different category or service - allowed");
        }
      }
    }

    // 5️⃣ حساب تاريخ انتهاء الاشتراك
    const expiryDate = new Date(body.expiry);
    console.log("📆 New expiry date:", expiryDate.toISOString());

    // تحديد examCategory بناءً على نوع الاشتراك
    let examCategory = null;
    if (body.subscriptionType === "examen") {
      // إذا كان اشتراك امتحانات، نحدد الفئة
      examCategory = `examTest${body.category}`; // مثل: examTestA, examTestB, examTestC
      console.log("📝 Exam category set:", examCategory);
    }

    // 6️⃣ إنشاء أو تحديث المستخدم
    let user;
    if (existingUser) {
      // المستخدم موجود، نحدث بياناته الأساسية فقط إذا لزم الأمر
      user = await prisma.user.update({
        where: { email: emailNormalized },
        data: {
          name: body.fullName,
          password: body.password,
          phone: body.phone,
          // تحديث الحقول القديمة للتوافق (نستخدم آخر اشتراك)
          category: body.category || existingUser.category,
          paymentType: body.paymentMethod,
          subscriptionType: body.subscriptionType || existingUser.subscriptionType,
          examCategory: examCategory || existingUser.examCategory,
          expiryDate: expiryDate,
          status: "active", // ✅ تفعيل مباشر للتجربة
        }
      });
      console.log("✅ Existing user updated with active status");
    } else {
      // مستخدم جديد
      user = await prisma.user.create({
        data: {
          email: emailNormalized,
          name: body.fullName,
          password: body.password,
          phone: body.phone,
          category: body.category || "B",
          paymentType: body.paymentMethod,
          subscriptionType: body.subscriptionType || "theorie",
          examCategory: examCategory,
          expiryDate: expiryDate,
          status: "active", // ✅ تفعيل مباشر للتجربة
        }
      });
      console.log("✅ New user created with active status");
    }

    // 7️⃣ إضافة الاشتراك في جدول Subscriptions بحالة نشطة
    await prisma.subscription.upsert({
      where: {
        userId_subscriptionType_category: {
          userId: user.id,
          subscriptionType: body.subscriptionType || "theorie",
          category: body.category || "B"
        }
      },
      update: {
        expiryDate: expiryDate,
        examCategory: examCategory,
        isActive: true // ✅ نشط مباشرة للتجربة
      },
      create: {
        userId: user.id,
        subscriptionType: body.subscriptionType || "theorie",
        category: body.category || "B",
        examCategory: examCategory,
        expiryDate: expiryDate,
        isActive: true // ✅ نشط مباشرة للتجربة
      }
    });

    console.log("✅ Subscription created/updated with active status - ready to use");

    // 8️⃣ إعادة الاستجابة الناجحة (الاشتراك مفعّل)
    return NextResponse.json({
      success: true,
      email: user.email,
      cat: user.category,
      subscriptionType: user.subscriptionType,
      examCategory: user.examCategory,
      exp: user.expiryDate.getTime(),
    });

  } catch (error: any) {
    // 8️⃣ التعامل مع أي خطأ
    console.error("❌ API Error:", error);
    console.error("❌ Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { 
        success: false, 
        message: "حدث خطأ في الخادم",
        error: error.message // إضافة رسالة الخطأ للتشخيص
      },
      { status: 500 }
    );
  }
}
