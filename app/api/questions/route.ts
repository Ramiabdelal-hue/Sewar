import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Helper function to get the correct Prisma model based on category
function getLessonModel(category: string) {
  if (category === "A") return prisma.lessonA;
  if (category === "B") return prisma.lessonB;
  if (category === "C") return prisma.lessonC;
  return null;
}

function getQuestionModel(category: string) {
  if (category === "A") return prisma.questionA;
  if (category === "B") return prisma.questionB;
  if (category === "C") return prisma.questionC;
  return null;
}

// Helper function to determine category from lessonId
async function getCategoryFromLessonId(lessonId: number): Promise<string | null> {
  // Check in LessonA
  const lessonA = await prisma.lessonA.findUnique({ where: { id: lessonId } });
  if (lessonA) return "A";
  
  // Check in LessonB
  const lessonB = await prisma.lessonB.findUnique({ where: { id: lessonId } });
  if (lessonB) return "B";
  
  // Check in LessonC
  const lessonC = await prisma.lessonC.findUnique({ where: { id: lessonId } });
  if (lessonC) return "C";
  
  return null;
}

// GET - جلب الأسئلة
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    const categoryParam = searchParams.get("category");
    const allLessons = searchParams.get("all"); // جلب كل أسئلة الـ category

    if (!lessonId && !categoryParam) {
      return NextResponse.json({ success: false, message: "يجب تحديد lessonId أو category" }, { status: 400 });
    }

    const lessonIdNum = lessonId ? parseInt(lessonId) : null;

    let category = categoryParam?.toUpperCase() || null;
    if (!category && lessonIdNum) {
      category = await getCategoryFromLessonId(lessonIdNum);
    }

    if (!category) {
      return NextResponse.json({ success: false, message: "الدرس غير موجود" }, { status: 404 });
    }

    // إذا all=1 أو لا يوجد lessonId → جلب كل أسئلة الـ category
    if (allLessons || !lessonIdNum) {
      console.log(`🔍 Fetching ALL questions for category ${category}`);
      let questions;
      if (category === "A") questions = await prisma.questionA.findMany({ orderBy: { createdAt: 'asc' } });
      else if (category === "B") questions = await prisma.questionB.findMany({ orderBy: { createdAt: 'asc' } });
      else if (category === "C") questions = await prisma.questionC.findMany({ orderBy: { createdAt: 'asc' } });
      return NextResponse.json({ success: true, questions: questions || [] });
    }

    console.log(`🔍 Fetching questions for lessonId ${lessonId} in category ${category}`);

    let lessonRecord;
    if (category === "A") {
      lessonRecord = await prisma.lessonA.findUnique({
        where: { id: lessonIdNum },
        include: { questions: { orderBy: { createdAt: 'asc' } } }
      });
    } else if (category === "B") {
      lessonRecord = await prisma.lessonB.findUnique({
        where: { id: lessonIdNum },
        include: { questions: { orderBy: { createdAt: 'asc' } } }
      });
    } else if (category === "C") {
      lessonRecord = await prisma.lessonC.findUnique({
        where: { id: lessonIdNum },
        include: { questions: { orderBy: { createdAt: 'asc' } } }
      });
    }

    if (!lessonRecord) {
      return NextResponse.json({ success: false, message: "الدرس غير موجود" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      questions: lessonRecord.questions,
      lesson: lessonRecord
    });

  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ success: false, message: "خطأ في جلب الأسئلة" }, { status: 500 });
  }
}

// POST - إضافة سؤال جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      lessonId,
      text,
      textNL,
      textFR,
      textAR,
      videoUrls = [],
      audioUrl = "",
      explanationNL,
      explanationFR,
      explanationAR,
      answer1,
      answer2,
      answer3,
      correctAnswer,
      category: categoryParam,
    } = body;

    if (!lessonId) {
      return NextResponse.json({ success: false, message: "يجب تحديد الدرس" }, { status: 400 });
    }

    const lessonIdNum = typeof lessonId === 'string' ? parseInt(lessonId) : lessonId;
    
    // استخدم category من الـ payload مباشرة إذا موجود، وإلا ابحث عنه
    let category = categoryParam?.toUpperCase() || null;
    if (!category) {
      category = await getCategoryFromLessonId(lessonIdNum);
    }
    
    if (!category) {
      return NextResponse.json({ success: false, message: "الدرس غير موجود" }, { status: 404 });
    }

    const questionData = {
      text: text || textNL || textFR || textAR || explanationNL || "",
      textNL: textNL || null,
      textFR: textFR || null,
      textAR: textAR || null,
      videoUrls: videoUrls,
      audioUrl: audioUrl || null,
      explanationNL: explanationNL || null,
      explanationFR: explanationFR || null,
      explanationAR: explanationAR || null,
      answer1: answer1 || null,
      answer2: answer2 || null,
      answer3: answer3 || null,
      correctAnswer: correctAnswer || null,
      isFree: body.isFree === true,
      lessonId: lessonIdNum
    };

    let question;
    if (category === "A") question = await prisma.questionA.create({ data: questionData });
    else if (category === "B") question = await prisma.questionB.create({ data: questionData });
    else if (category === "C") question = await prisma.questionC.create({ data: questionData });

    return NextResponse.json({ success: true, question });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "خطأ في حفظ السؤال",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// DELETE - حذف سؤال
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "");
    const categoryParam = searchParams.get("category")?.toUpperCase();

    if (!id) return NextResponse.json({ success: false, message: "معرف السؤال مطلوب" }, { status: 400 });

    let deleted = false;

    if (categoryParam === "A") { await prisma.questionA.delete({ where: { id } }); deleted = true; }
    else if (categoryParam === "B") { await prisma.questionB.delete({ where: { id } }); deleted = true; }
    else if (categoryParam === "C") { await prisma.questionC.delete({ where: { id } }); deleted = true; }
    else {
      try { await prisma.questionA.delete({ where: { id } }); deleted = true; } catch {}
      if (!deleted) { try { await prisma.questionB.delete({ where: { id } }); deleted = true; } catch {} }
      if (!deleted) { try { await prisma.questionC.delete({ where: { id } }); deleted = true; } catch {} }
    }

    if (!deleted) return NextResponse.json({ success: false, message: "السؤال غير موجود" }, { status: 404 });
    return NextResponse.json({ success: true, message: "تم حذف السؤال بنجاح" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "خطأ في حذف السؤال" }, { status: 500 });
  }
}


// PUT - تعديل سؤال
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, text, textNL, textFR, textAR, explanationNL, explanationFR, explanationAR, answer1, answer2, answer3, correctAnswer, videoUrls, audioUrl, category: categoryParam, isFree } = body;

    if (!id) return NextResponse.json({ success: false, message: "معرف السؤال مطلوب" }, { status: 400 });

    const updateData: any = {};
    if (text !== undefined) updateData.text = text;
    if (textNL !== undefined) updateData.textNL = textNL || null;
    if (textFR !== undefined) updateData.textFR = textFR || null;
    if (textAR !== undefined) updateData.textAR = textAR || null;
    if (explanationNL !== undefined) updateData.explanationNL = explanationNL || null;
    if (explanationFR !== undefined) updateData.explanationFR = explanationFR || null;
    if (explanationAR !== undefined) updateData.explanationAR = explanationAR || null;
    if (answer1 !== undefined) updateData.answer1 = answer1 || null;
    if (answer2 !== undefined) updateData.answer2 = answer2 || null;
    if (answer3 !== undefined) updateData.answer3 = answer3 || null;
    if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
    if (videoUrls !== undefined) updateData.videoUrls = videoUrls;
    if (audioUrl !== undefined) updateData.audioUrl = audioUrl || null;
    if (isFree !== undefined) updateData.isFree = isFree;

    let updated = false;
    const cat = categoryParam?.toUpperCase();

    // إذا عندنا category نستخدمه مباشرة
    if (cat === "A") { await prisma.questionA.update({ where: { id }, data: updateData }); updated = true; }
    else if (cat === "B") { await prisma.questionB.update({ where: { id }, data: updateData }); updated = true; }
    else if (cat === "C") { await prisma.questionC.update({ where: { id }, data: updateData }); updated = true; }
    else {
      // fallback: جرب الثلاثة
      try { await prisma.questionA.update({ where: { id }, data: updateData }); updated = true; } catch {}
      if (!updated) { try { await prisma.questionB.update({ where: { id }, data: updateData }); updated = true; } catch {} }
      if (!updated) { try { await prisma.questionC.update({ where: { id }, data: updateData }); updated = true; } catch {} }
    }

    if (!updated) return NextResponse.json({ success: false, message: "السؤال غير موجود" }, { status: 404 });
    return NextResponse.json({ success: true, message: "تم تعديل السؤال بنجاح" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "خطأ في تعديل السؤال", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
