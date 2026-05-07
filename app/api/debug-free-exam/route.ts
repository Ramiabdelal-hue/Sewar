import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// endpoint مؤقت للتشخيص - يُحذف بعد حل المشكلة
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.toUpperCase() || "B";
    const lessonId = searchParams.get("lessonId") ? parseInt(searchParams.get("lessonId")!) : null;

    let examQuestions: any[] = [];

    if (category === "A") {
      examQuestions = await prisma.examQuestionA.findMany({
        where: { isFree: true },
        select: { id: true, textNL: true, videoUrls: true, lessonId: true, isFree: true },
      });
    } else if (category === "B") {
      examQuestions = await prisma.examQuestionB.findMany({
        where: { isFree: true },
        select: { id: true, textNL: true, videoUrls: true, lessonId: true, isFree: true },
      });
    } else if (category === "C") {
      examQuestions = await prisma.examQuestionC.findMany({
        where: { isFree: true },
        select: { id: true, textNL: true, videoUrls: true, lessonId: true, isFree: true },
      });
    }

    const filtered = lessonId
      ? examQuestions.filter(q => q.lessonId === lessonId)
      : examQuestions;

    const withImages = filtered.filter(q => q.videoUrls && q.videoUrls.length > 0);
    const withoutImages = filtered.filter(q => !q.videoUrls || q.videoUrls.length === 0);

    return NextResponse.json({
      category,
      lessonId,
      total: filtered.length,
      withImages: withImages.length,
      withoutImages: withoutImages.length,
      // أول 5 أسئلة مع صور
      sampleWithImages: withImages.slice(0, 5).map(q => ({
        id: q.id,
        lessonId: q.lessonId,
        text: q.textNL?.slice(0, 50),
        videoUrls: q.videoUrls,
      })),
      // أول 5 أسئلة بدون صور
      sampleWithoutImages: withoutImages.slice(0, 5).map(q => ({
        id: q.id,
        lessonId: q.lessonId,
        text: q.textNL?.slice(0, 50),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
