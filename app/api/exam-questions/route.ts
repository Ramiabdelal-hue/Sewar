import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Helper to determine category from lessonId
async function getCategoryFromLessonId(lessonId: number): Promise<string | null> {
  const lessonA = await prisma.lessonA.findUnique({ where: { id: lessonId } });
  if (lessonA) return "A";
  
  const lessonB = await prisma.lessonB.findUnique({ where: { id: lessonId } });
  if (lessonB) return "B";
  
  const lessonC = await prisma.lessonC.findUnique({ where: { id: lessonId } });
  if (lessonC) return "C";
  
  return null;
}

// GET - جلب أسئلة الامتحان
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    const categoryParam = searchParams.get("category");
    const allLessons = searchParams.get("all"); // جلب كل الأسئلة بدون فلتر lessonId

    const lessonIdNum = lessonId ? parseInt(lessonId) : null;
    
    let category = categoryParam?.toUpperCase() || null;
    if (!category && lessonIdNum) {
      category = await getCategoryFromLessonId(lessonIdNum);
    }
    
    if (!category) {
      return NextResponse.json({ success: false, message: "يجب تحديد category" }, { status: 400 });
    }

    console.log(`🔍 Fetching exam questions for category ${category}${lessonIdNum ? ` lessonId ${lessonIdNum}` : " (all lessons)"}`);

    const where = lessonIdNum && !allLessons ? { lessonId: lessonIdNum } : {};
    const isAdmin = searchParams.get("admin") === "1";
    const order: "asc" | "desc" = isAdmin ? "desc" : "asc";

    let questions;
    if (category === "A") {
      questions = await prisma.examQuestionA.findMany({ where, orderBy: { createdAt: order } });
    } else if (category === "B") {
      questions = await prisma.examQuestionB.findMany({ where, orderBy: { createdAt: order } });
    } else if (category === "C") {
      questions = await prisma.examQuestionC.findMany({ where, orderBy: { createdAt: order } });
    }

    return NextResponse.json({ success: true, questions: questions || [] });

  } catch (error) {
    console.error("Error fetching exam questions:", error);
    return NextResponse.json({ success: false, message: "خطأ في جلب أسئلة الامتحان" }, { status: 500 });
  }
}

// POST - إضافة سؤال امتحان جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lessonId, textNL, videoUrls = [], audioUrl = "", answer1, answer2, answer3, correctAnswer, category: categoryParam } = body;

    if (!lessonId || !textNL) {
      return NextResponse.json({ success: false, message: "يجب إدخال lessonId ونص السؤال بالهولندية" }, { status: 400 });
    }
    if (!answer1 || !answer2 || !correctAnswer) {
      return NextResponse.json({ success: false, message: "يجب إدخال إجابتين على الأقل واختيار الإجابة الصحيحة" }, { status: 400 });
    }

    const lessonIdNum = typeof lessonId === 'string' ? parseInt(lessonId) : lessonId;
    let category = categoryParam?.toUpperCase() || await getCategoryFromLessonId(lessonIdNum);
    if (!category) return NextResponse.json({ success: false, message: "الدرس غير موجود" }, { status: 404 });

    const questionData = { text: textNL, textNL, videoUrls, audioUrl: audioUrl || null, answer1, answer2, answer3: answer3 || null, correctAnswer, isFree: body.isFree === true, points: body.points || 1, freeGroup: body.freeGroup ?? null, lessonId: lessonIdNum };
    let question;
    if (category === "A") question = await prisma.examQuestionA.create({ data: questionData });
    else if (category === "B") question = await prisma.examQuestionB.create({ data: questionData });
    else if (category === "C") question = await prisma.examQuestionC.create({ data: questionData });

    return NextResponse.json({ success: true, question });
  } catch (error) {
    return NextResponse.json({ success: false, message: "خطأ في حفظ سؤال الامتحان", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// DELETE - حذف سؤال امتحان
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "");

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "معرف السؤال مطلوب"
      }, { status: 400 });
    }

    let deleted = false;
    
    try {
      await prisma.examQuestionA.delete({ where: { id } });
      deleted = true;
    } catch (e) {}
    
    if (!deleted) {
      try {
        await prisma.examQuestionB.delete({ where: { id } });
        deleted = true;
      } catch (e) {}
    }
    
    if (!deleted) {
      try {
        await prisma.examQuestionC.delete({ where: { id } });
        deleted = true;
      } catch (e) {}
    }

    if (!deleted) {
      return NextResponse.json({
        success: false,
        message: "السؤال غير موجود"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "تم حذف السؤال بنجاح"
    });

  } catch (error) {
    console.error("Error deleting exam question:", error);
    return NextResponse.json({
      success: false,
      message: "خطأ في حذف السؤال"
    }, { status: 500 });
  }
}


// PUT - تعديل سؤال امتحان
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, textNL, answer1, answer2, answer3, correctAnswer, videoUrls, audioUrl, category: categoryParam, isFree } = body;

    if (!id) return NextResponse.json({ success: false, message: "معرف السؤال مطلوب" }, { status: 400 });

    const updateData: any = {};
    if (textNL !== undefined) { updateData.text = textNL; updateData.textNL = textNL; }
    if (answer1 !== undefined) updateData.answer1 = answer1;
    if (answer2 !== undefined) updateData.answer2 = answer2;
    if (answer3 !== undefined) updateData.answer3 = answer3;
    if (isFree !== undefined) updateData.isFree = isFree;
    if (body.points !== undefined) updateData.points = body.points || 1;
    if (body.freeGroup !== undefined) updateData.freeGroup = body.freeGroup ?? null;
    if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
    if (videoUrls !== undefined) updateData.videoUrls = videoUrls;
    if (audioUrl !== undefined) updateData.audioUrl = audioUrl || null;

    let updated = false;
    const cat = categoryParam?.toUpperCase();

    if (cat === "A") { await prisma.examQuestionA.update({ where: { id }, data: updateData }); updated = true; }
    else if (cat === "B") { await prisma.examQuestionB.update({ where: { id }, data: updateData }); updated = true; }
    else if (cat === "C") { await prisma.examQuestionC.update({ where: { id }, data: updateData }); updated = true; }
    else {
      try { await prisma.examQuestionA.update({ where: { id }, data: updateData }); updated = true; } catch {}
      if (!updated) { try { await prisma.examQuestionB.update({ where: { id }, data: updateData }); updated = true; } catch {} }
      if (!updated) { try { await prisma.examQuestionC.update({ where: { id }, data: updateData }); updated = true; } catch {} }
    }

    if (!updated) return NextResponse.json({ success: false, message: "السؤال غير موجود" }, { status: 404 });
    return NextResponse.json({ success: true, message: "تم تعديل السؤال بنجاح" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "خطأ في تعديل السؤال", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
