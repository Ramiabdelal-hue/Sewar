import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, unauthorizedResponse } from "@/lib/adminAuth";

// PUT - تحديث جميع أسئلة ExamQuestionB من 5 نقاط إلى 1 نقطة
export async function PUT(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { category, fromPoints, toPoints } = body;

    if (!category || fromPoints === undefined || toPoints === undefined) {
      return NextResponse.json({ success: false, message: "يجب تحديد category و fromPoints و toPoints" }, { status: 400 });
    }

    let result;
    if (category === "A") {
      result = await prisma.examQuestionA.updateMany({
        where: { points: fromPoints },
        data: { points: toPoints },
      });
    } else if (category === "B") {
      result = await prisma.examQuestionB.updateMany({
        where: { points: fromPoints },
        data: { points: toPoints },
      });
    } else if (category === "C") {
      result = await prisma.examQuestionC.updateMany({
        where: { points: fromPoints },
        data: { points: toPoints },
      });
    } else {
      return NextResponse.json({ success: false, message: "category غير صحيح" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `تم تحديث ${result.count} سؤال من ${fromPoints} نقطة إلى ${toPoints} نقطة في الفئة ${category}`,
      count: result.count,
    });

  } catch (error) {
    console.error("Error updating points:", error);
    return NextResponse.json({
      success: false,
      message: "خطأ في تحديث النقاط",
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
