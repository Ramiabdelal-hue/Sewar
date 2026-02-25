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

    if (!lessonId) {
      return NextResponse.json({
        success: false,
        message: "يجب تحديد lessonId"
      }, { status: 400 });
    }

    const lessonIdNum = parseInt(lessonId);
    const category = await getCategoryFromLessonId(lessonIdNum);
    
    if (!category) {
      return NextResponse.json({
        success: false,
        message: "الدرس غير موجود"
      }, { status: 404 });
    }

    console.log(`🔍 Fetching exam questions for lessonId ${lessonId} in category ${category}`);

    let questions;
    
    if (category === "A") {
      questions = await prisma.examQuestionA.findMany({
        where: { lessonId: lessonIdNum },
        orderBy: { createdAt: 'desc' }
      });
    } else if (category === "B") {
      questions = await prisma.examQuestionB.findMany({
        where: { lessonId: lessonIdNum },
        orderBy: { createdAt: 'desc' }
      });
    } else if (category === "C") {
      questions = await prisma.examQuestionC.findMany({
        where: { lessonId: lessonIdNum },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json({
      success: true,
      questions: questions
    });

  } catch (error) {
    console.error("Error fetching exam questions:", error);
    return NextResponse.json({
      success: false,
      message: "خطأ في جلب أسئلة الامتحان"
    }, { status: 500 });
  }
}

// POST - إضافة سؤال امتحان جديد
export async function POST(request: NextRequest) {
  try {
    console.log("📥 Received POST request for exam question");
    const body = await request.json();
    
    const {
      lessonId,
      textNL,
      videoUrls = [],
      audioUrl = "",
      answer1,
      answer2,
      answer3,
      correctAnswer
    } = body;

    if (!lessonId || !textNL) {
      return NextResponse.json({
        success: false,
        message: "يجب إدخال lessonId ونص السؤال بالهولندية"
      }, { status: 400 });
    }

    if (!answer1 || !answer2 || !answer3 || !correctAnswer) {
      return NextResponse.json({
        success: false,
        message: "يجب إدخال 3 إجابات واختيار الإجابة الصحيحة"
      }, { status: 400 });
    }

    const lessonIdNum = typeof lessonId === 'string' ? parseInt(lessonId) : lessonId;
    const category = await getCategoryFromLessonId(lessonIdNum);
    
    if (!category) {
      return NextResponse.json({
        success: false,
        message: "الدرس غير موجود"
      }, { status: 404 });
    }

    console.log(`💾 Creating exam question for category ${category}`);

    // إنشاء السؤال
    let question;
    const questionData = {
      text: textNL,
      textNL: textNL,
      videoUrls: videoUrls,
      audioUrl: audioUrl || null,
      answer1: answer1,
      answer2: answer2,
      answer3: answer3,
      correctAnswer: correctAnswer,
      lessonId: lessonIdNum
    };

    if (category === "A") {
      question = await prisma.examQuestionA.create({ data: questionData });
    } else if (category === "B") {
      question = await prisma.examQuestionB.create({ data: questionData });
    } else if (category === "C") {
      question = await prisma.examQuestionC.create({ data: questionData });
    }

    console.log("✅ Exam question created successfully:", question?.id);
    return NextResponse.json({
      success: true,
      question: question
    });

  } catch (error) {
    console.error("❌ Error creating exam question:", error);
    return NextResponse.json({
      success: false,
      message: "خطأ في حفظ سؤال الامتحان",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
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
