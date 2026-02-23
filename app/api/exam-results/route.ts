import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// حفظ نتيجة امتحان
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("📥 Received exam result data:", body);

    const { userEmail, lessonTitle, category, score, totalQuestions, answers } = body;

    if (!userEmail || !lessonTitle || !category || score === undefined || !totalQuestions || !answers) {
      console.error("❌ Missing required fields:", { userEmail, lessonTitle, category, score, totalQuestions, answers: !!answers });
      return NextResponse.json({
        success: false,
        message: "جميع الحقول مطلوبة"
      }, { status: 400 });
    }

    const percentage = (score / totalQuestions) * 100;
    const passed = percentage >= 70;

    console.log("💾 Saving to database:", { userEmail, lessonTitle, category, score, totalQuestions, percentage, passed });

    // التحقق من وجود المستخدم أولاً
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      console.error("❌ User not found:", userEmail);
      return NextResponse.json({
        success: false,
        message: "المستخدم غير موجود"
      }, { status: 404 });
    }

    console.log("✅ User found:", user.email);

    const result = await prisma.examResult.create({
      data: {
        userEmail,
        lessonTitle,
        category,
        score,
        totalQuestions,
        percentage,
        passed,
        answers
      }
    });

    console.log("✅ Result saved successfully:", result);

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error("❌ Error saving exam result:", error);
    console.error("❌ Error details:", error instanceof Error ? error.stack : error);
    return NextResponse.json({
      success: false,
      message: "خطأ في حفظ النتيجة",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// جلب نتائج المستخدم
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("email");

    if (!userEmail) {
      return NextResponse.json({
        success: false,
        message: "البريد الإلكتروني مطلوب"
      }, { status: 400 });
    }

    const results = await prisma.examResult.findMany({
      where: { userEmail },
      orderBy: { completedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error("Error fetching exam results:", error);
    return NextResponse.json({
      success: false,
      message: "خطأ في جلب النتائج"
    }, { status: 500 });
  }
}
