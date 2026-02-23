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

    if (!lessonId) {
      return NextResponse.json({
        success: false,
        message: "يجب تحديد lessonId"
      }, { status: 400 });
    }

    const lessonIdNum = parseInt(lessonId);
    
    // Determine category from lessonId
    const category = await getCategoryFromLessonId(lessonIdNum);
    
    if (!category) {
      return NextResponse.json({
        success: false,
        message: "الدرس غير موجود"
      }, { status: 404 });
    }

    console.log(`🔍 Fetching questions for lessonId ${lessonId} in category ${category}`);

    let lessonRecord;
    
    if (category === "A") {
      lessonRecord = await prisma.lessonA.findUnique({
        where: { id: lessonIdNum },
        include: {
          questions: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });
    } else if (category === "B") {
      lessonRecord = await prisma.lessonB.findUnique({
        where: { id: lessonIdNum },
        include: {
          questions: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });
    } else if (category === "C") {
      lessonRecord = await prisma.lessonC.findUnique({
        where: { id: lessonIdNum },
        include: {
          questions: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });
    }

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
    console.error("Error fetching questions:", error);
    return NextResponse.json({
      success: false,
      message: "خطأ في جلب الأسئلة"
    }, { status: 500 });
  }
}

// POST - إضافة سؤال جديد
export async function POST(request: NextRequest) {
  try {
    console.log("📥 Received POST request");
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
    const answer1 = formData.get("answer1") as string;
    const answer2 = formData.get("answer2") as string;
    const answer3 = formData.get("answer3") as string;
    const correctAnswer = formData.get("correctAnswer") ? parseInt(formData.get("correctAnswer") as string) : null;

    console.log("📋 Form data received:", {
      lessonId,
      hasText: !!text,
      hasTextNL: !!textNL,
      hasTextFR: !!textFR,
      hasTextAR: !!textAR,
      hasExplanationNL: !!explanationNL,
      hasExplanationFR: !!explanationFR,
      hasExplanationAR: !!explanationAR,
      hasAnswer1: !!answer1,
      hasAnswer2: !!answer2,
      hasAnswer3: !!answer3,
      correctAnswer
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
    
    // Determine category from lessonId
    const category = await getCategoryFromLessonId(lessonIdNum);
    
    if (!category) {
      return NextResponse.json({
        success: false,
        message: "الدرس غير موجود"
      }, { status: 404 });
    }

    console.log(`💾 Creating question for category ${category}`);

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

    // إنشاء السؤال في الجدول المناسب
    let question;
    const questionData = {
      text: text || textNL || textFR || textAR || "",
      textNL: textNL || null,
      textFR: textFR || null,
      textAR: textAR || null,
      videoUrls: videoUrls,
      audioUrl: audioUrl,
      explanationNL: explanationNL || null,
      explanationFR: explanationFR || null,
      explanationAR: explanationAR || null,
      answer1: answer1 || null,
      answer2: answer2 || null,
      answer3: answer3 || null,
      correctAnswer: correctAnswer,
      lessonId: lessonIdNum
    };

    if (category === "A") {
      question = await prisma.questionA.create({ data: questionData });
    } else if (category === "B") {
      question = await prisma.questionB.create({ data: questionData });
    } else if (category === "C") {
      question = await prisma.questionC.create({ data: questionData });
    }

    console.log("✅ Question created successfully:", question?.id);
    return NextResponse.json({
      success: true,
      question: question
    });

  } catch (error) {
    console.error("❌ Error creating question:", error);
    console.error("❌ Error details:", error instanceof Error ? error.message : String(error));
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

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "معرف السؤال مطلوب"
      }, { status: 400 });
    }

    // Try to find and delete from all category tables
    let deleted = false;
    
    try {
      await prisma.questionA.delete({ where: { id } });
      deleted = true;
    } catch (e) {
      // Not in QuestionA, try next
    }
    
    if (!deleted) {
      try {
        await prisma.questionB.delete({ where: { id } });
        deleted = true;
      } catch (e) {
        // Not in QuestionB, try next
      }
    }
    
    if (!deleted) {
      try {
        await prisma.questionC.delete({ where: { id } });
        deleted = true;
      } catch (e) {
        // Not in QuestionC
      }
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
    console.error("Error deleting question:", error);
    return NextResponse.json({
      success: false,
      message: "خطأ في حذف السؤال"
    }, { status: 500 });
  }
}
