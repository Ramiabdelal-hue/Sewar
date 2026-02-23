import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - جلب الدروس حسب الفئة
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const questionType = searchParams.get("questionType");

    if (!categoryParam) {
      return NextResponse.json({
        success: false,
        message: "يجب تحديد الفئة"
      }, { status: 400 });
    }

    // تحويل الفئة إلى أحرف كبيرة للتأكد من التوافق
    // إذا كانت الفئة تبدأ بـ "exam" نستخرج الحرف (مثل examA -> A)
    let category = categoryParam.toUpperCase();
    if (category.startsWith("EXAM")) {
      category = category.replace("EXAM", "");
    }

    console.log(`🔍 Fetching lessons for category: ${category} (original: ${categoryParam}), questionType: ${questionType || 'all'}`);

    let lessons;

    // بناء شرط الفلتر
    const whereCondition: any = {};
    if (questionType) {
      whereCondition.questionType = questionType;
    }
    // إذا لم يتم تحديد questionType، نجلب جميع الدروس بدون فلتر

    // جلب الدروس من الجدول المناسب حسب الفئة
    if (category === "A") {
      lessons = await prisma.lessonA.findMany({
        where: whereCondition,
        orderBy: {
          id: 'asc'
        }
      });
    } else if (category === "B") {
      lessons = await prisma.lessonB.findMany({
        where: whereCondition,
        orderBy: {
          id: 'asc'
        }
      });
    } else if (category === "C") {
      lessons = await prisma.lessonC.findMany({
        where: whereCondition,
        orderBy: {
          id: 'asc'
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `فئة غير صحيحة: ${category}`
      }, { status: 400 });
    }

    console.log(`✅ Found ${lessons.length} lessons for category ${category}`);

    return NextResponse.json({
      success: true,
      lessons: lessons
    });

  } catch (error) {
    console.error("❌ Error fetching lessons:", error);
    return NextResponse.json({
      success: false,
      message: "خطأ في جلب الدروس",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
