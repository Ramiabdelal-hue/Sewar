import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - جلب دروس Praktijk حسب النوع
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json({
        success: false,
        message: "يجب تحديد النوع (training أو hazard)"
      }, { status: 400 });
    }

    console.log(`🔍 Fetching Praktijk lessons for type: ${type}`);

    const lessons = await prisma.praktijkLesson.findMany({
      where: {
        type: type
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log(`✅ Found ${lessons.length} Praktijk lessons for type ${type}`);

    return NextResponse.json({
      success: true,
      lessons: lessons
    });

  } catch (error) {
    console.error("❌ Error fetching Praktijk lessons:", error);
    return NextResponse.json({
      success: false,
      message: "خطأ في جلب دروس Praktijk",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
