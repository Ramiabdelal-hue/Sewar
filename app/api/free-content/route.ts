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
        where: { isFree: true }, orderBy: [{ lessonId: "asc" }, { createdAt: "asc" }],
        include: { lesson: { select: { title: true, description: true, examLabel: true } } }
      });
      examQuestions = await prisma.examQuestionA.findMany({
        where: { isFree: true }, orderBy: [{ freeGroup: "asc" }, { createdAt: "asc" }],
        include: { lesson: { select: { title: true, examLabel: true } } }
      });
    } else if (category === "B") {
      questions = await prisma.questionB.findMany({
        where: { isFree: true }, orderBy: [{ lessonId: "asc" }, { createdAt: "asc" }],
        include: { lesson: { select: { title: true, description: true, examLabel: true } } }
      });
      examQuestions = await prisma.examQuestionB.findMany({
        where: { isFree: true }, orderBy: [{ freeGroup: "asc" }, { createdAt: "asc" }],
        include: { lesson: { select: { title: true, examLabel: true } } }
      });
    } else if (category === "C") {
      questions = await prisma.questionC.findMany({
        where: { isFree: true }, orderBy: [{ lessonId: "asc" }, { createdAt: "asc" }],
        include: { lesson: { select: { title: true, description: true, examLabel: true } } }
      });
      examQuestions = await prisma.examQuestionC.findMany({
        where: { isFree: true }, orderBy: [{ freeGroup: "asc" }, { createdAt: "asc" }],
        include: { lesson: { select: { title: true, examLabel: true } } }
      });
    }

    // تجميع أسئلة الامتحان حسب freeGroup
    // الأسئلة بدون freeGroup تُجمع في مجموعة واحدة (group 0)
    const groupsMap: Record<number, any[]> = {};
    for (const q of examQuestions) {
      const g = q.freeGroup ?? 0;
      if (!groupsMap[g]) groupsMap[g] = [];
      groupsMap[g].push(q);
    }

    // ترتيب المجموعات: 1, 2, 3... ثم 0 (بدون مجموعة) في النهاية
    const sortedKeys = Object.keys(groupsMap)
      .map(Number)
      .sort((a, b) => {
        if (a === 0) return 1;
        if (b === 0) return -1;
        return a - b;
      });

    const examGroups = sortedKeys.map(g => ({
      group: g,
      label: g === 0 ? null : `Examen ${g}`,
      questions: groupsMap[g],
    }));

    return NextResponse.json({ success: true, questions, examQuestions, examGroups });
  } catch (error) {
    return NextResponse.json({ success: false, message: "خطأ في جلب المحتوى المجاني" }, { status: 500 });
  }
}
