import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - جلب الامتحانات حسب الفئة
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");

    if (!categoryParam) {
      return NextResponse.json({
        success: false,
        message: "يجب تحديد الفئة"
      }, { status: 400 });
    }

    const category = categoryParam.toUpperCase();
    console.log(`🔍 Fetching exams for category: ${category}`);

    let exams;

    if (category === "A") {
      exams = await prisma.examA.findMany({
        orderBy: { id: 'asc' }
      });
    } else if (category === "B") {
      exams = await prisma.examB.findMany({
        orderBy: { id: 'asc' }
      });
    } else if (category === "C") {
      exams = await prisma.examC.findMany({
        orderBy: { id: 'asc' }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `فئة غير صحيحة: ${category}`
      }, { status: 400 });
    }

    console.log(`✅ Found ${exams.length} exams for category ${category}`);

    return NextResponse.json({
      success: true,
      exams: exams
    });

  } catch (error) {
    console.error("❌ Error fetching exams:", error);
    return NextResponse.json({
      success: false,
      message: "خطأ في جلب الامتحانات",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
