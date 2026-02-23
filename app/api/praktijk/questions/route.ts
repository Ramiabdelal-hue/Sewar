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
    const formData = await request.formData();
    
    const lessonId = formData.get("lessonId") as string;
    const text = formData.get("text") as string;
    const textNL = formData.get("textNL") as string;
    const textFR = formData.get("textFR") as string;
    const textAR = formData.get("textAR") as string;
    const videos = formData.getAll("videos") as File[];
    const audio = formData.get("audio") as File | null;
    const explanationNL = formData.get("explanationNL") as string;
    const explanationFR = formData.get("explanationFR") as string;
    const explanationAR = formData.get("explanationAR") as string;

    console.log("📋 Form data received:", {
      lessonId,
      hasText: !!text,
      hasTextNL: !!textNL,
      hasTextFR: !!textFR,
      hasTextAR: !!textAR,
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

    const lessonIdNum = parseInt(lessonId);
    
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

    // حفظ الفيديوهات
    const videoUrls: string[] = [];
    const uploadDir = join(process.cwd(), "public", "uploads");
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    for (const video of videos) {
      if (video && video.size > 0) {
        const bytes = await video.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${video.name.replace(/\s/g, '_')}`;
        const filepath = join(uploadDir, filename);
        
        await writeFile(filepath, buffer);
        videoUrls.push(`/uploads/${filename}`);
      }
    }

    // حفظ الملف الصوتي
    let audioUrl: string | null = null;
    if (audio && audio.size > 0) {
      const bytes = await audio.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${audio.name.replace(/\s/g, '_')}`;
      const filepath = join(uploadDir, filename);
      
      await writeFile(filepath, buffer);
      audioUrl = `/uploads/${filename}`;
    }

    // إنشاء السؤال
    const question = await prisma.praktijkQuestion.create({
      data: {
        text: text || textNL || textFR || textAR || "",
        textNL: textNL || null,
        textFR: textFR || null,
        textAR: textAR || null,
        videoUrls: videoUrls,
        audioUrl: audioUrl,
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
