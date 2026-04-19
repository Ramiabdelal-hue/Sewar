import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.toUpperCase() || "B";

    let questions: any[] = [];
    let examQuestions: any[] = [];

    if (category === "A") {
      questions = await prisma.questionA.findMany({
        where: { isFree: true }, orderBy: { createdAt: "asc" },
        include: { lesson: { select: { title: true, description: true } } }
      });
      examQuestions = await prisma.examQuestionA.findMany({
        orderBy: { createdAt: "asc" },
        include: { lesson: { select: { title: true } } }
      });
    } else if (category === "B") {
      questions = await prisma.questionB.findMany({
        where: { isFree: true }, orderBy: { createdAt: "asc" },
        include: { lesson: { select: { title: true, description: true } } }
      });
      examQuestions = await prisma.examQuestionB.findMany({
        orderBy: { createdAt: "asc" },
        include: { lesson: { select: { title: true } } }
      });
    } else if (category === "C") {
      questions = await prisma.questionC.findMany({
        where: { isFree: true }, orderBy: { createdAt: "asc" },
        include: { lesson: { select: { title: true, description: true } } }
      });
      examQuestions = await prisma.examQuestionC.findMany({
        orderBy: { createdAt: "asc" },
        include: { lesson: { select: { title: true } } }
      });
    }

    return NextResponse.json({ success: true, questions, examQuestions });
  } catch (error) {
    return NextResponse.json({ success: false, message: "خطأ في جلب المحتوى المجاني" }, { status: 500 });
  }
}
