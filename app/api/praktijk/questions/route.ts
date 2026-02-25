import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// GET - جلب أسئلة Praktijk
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
    
    console.log(`🔍 Fetching Praktijk questions for lessonId ${lessonId}`);

    const lessonRecord = await prisma.praktijkLesson.findUnique({
      where: { id: lessonIdNum },
      include: {
        questions: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!lessonRecord) {
      return NextResponse.json({
        success: false,
        message: "الدرس غير موجود"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      questions: lessonRecord.questions,
      lesson: lessonRecord
    });

  } catch (error) {
    console.error("Error fetching Praktijk questions:", error);
    return NextResponse.json({
      success: false,
      message: "خطأ في جلب الأسئلة"
    }, { status: 500 });
  }
}

// POST - إضافة سؤال Praktijk جديد
export async function POST(request: NextRequest) {
  try {
    console.log("📥 Received POST request for Praktijk question");
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
      explanationAR
    } = body;

    console.log("📋 Data received:", {
      lessonId,
      hasText: !!text,
      hasTextNL: !!textNL,
      hasTextFR: !!textFR,
      hasTextAR: !!textAR,
      videoCount: videoUrls.length,
      hasAudio: !!audioUrl,
      hasExplanationNL: !!explanationNL,
      hasExplanationFR: !!explanationFR,
      hasExplanationAR: !!explanationAR
    });

    // التحقق من البيانات الأساسية
    if (!lessonId) {
      return NextResponse.json({
        success: false,
        message: "يجب تحديد الدرس"
      }, { status: 400 });
    }

    // التحقق من وجود نص السؤال بأي لغة
    if (!text && !textNL && !textFR && !textAR) {
      return NextResponse.json({
        success: false,
        message: "يجب إدخال نص السؤال بلغة واحدة على الأقل"
      }, { status: 400 });
    }

    const lessonIdNum = typeof lessonId === 'string' ? parseInt(lessonId) : lessonId;
    
    // التحقق من وجود الدرس
    const lesson = await prisma.praktijkLesson.findUnique({
      where: { id: lessonIdNum }
    });
    
    if (!lesson) {
      return NextResponse.json({
        success: false,
        message: "الدرس غير موجود"
      }, { status: 404 });
    }

    console.log(`💾 Creating Praktijk question for lesson ${lessonIdNum}`);

    // إنشاء السؤال
    const question = await prisma.praktijkQuestion.create({
      data: {
        text: text || textNL || textFR || textAR || "",
        textNL: textNL || null,
        textFR: textFR || null,
        textAR: textAR || null,
        videoUrls: videoUrls,
        audioUrl: audioUrl || null,
        explanationNL: explanationNL || null,
        explanationFR: explanationFR || null,
        explanationAR: explanationAR || null,
        lessonId: lessonIdNum
      }
    });

    console.log("✅ Praktijk question created successfully:", question.id);
    return NextResponse.json({
      success: true,
      question: question
    });

  } catch (error) {
    console.error("❌ Error creating Praktijk question:", error);
    console.error("❌ Error details:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({
      success: false,
      message: "خطأ في حفظ السؤال",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// DELETE - حذف سؤال Praktijk
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

    await prisma.praktijkQuestion.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف السؤال بنجاح"
    });

  } catch (error) {
    console.error("Error deleting Praktijk question:", error);
    return NextResponse.json({
      success: false,
      message: "خطأ في حذف السؤال"
    }, { status: 500 });
  }
}
