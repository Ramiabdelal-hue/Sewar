import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// GET - جلب أسئلة الامتحان حسب الفئة
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");

    if (!categoryParam) {
      return NextResponse.json({
        success: false,
        message: "يجب تحديد الفئة"
      }, { status: 400 });
    }

    const category = categoryParam.toUpperCase();
    console.log(`🔍 Fetching exam questions for category: ${category}`);

    let questions;

    if (category === "A") {
      questions = await prisma.examA.findMany({
        orderBy: { id: 'asc' }
      });
    } else if (category === "B") {
      questions = await prisma.examB.findMany({
        orderBy: { id: 'asc' }
      });
    } else if (category === "C") {
      questions = await prisma.examC.findMany({
        orderBy: { id: 'asc' }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `فئة غير صحيحة: ${category}`
      }, { status: 400 });
    }

    console.log(`✅ Found ${questions.length} exam questions for category ${category}`);

    return NextResponse.json({
      success: true,
      questions: questions
    });

  } catch (error) {
    console.error("❌ Error fetching exam questions:", error);
    return NextResponse.json({
      success: false,
      message: "خطأ في جلب أسئلة الامتحان",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// POST - إضافة سؤال امتحان جديد
export async function POST(request: NextRequest) {
  try {
    console.log("📥 Received POST request for exam question");
    const formData = await request.formData();
    
    const category = formData.get("category") as string;
    const text = formData.get("text") as string;
    const textNL = formData.get("textNL") as string;
    const images = formData.getAll("images") as File[];
    const audio = formData.get("audio") as File | null;
    const answer1 = formData.get("answer1") as string;
    const answer2 = formData.get("answer2") as string;
    const answer3 = formData.get("answer3") as string;
    const correctAnswer = formData.get("correctAnswer") ? parseInt(formData.get("correctAnswer") as string) : null;

    console.log("📋 Exam question data:", {
      category,
      hasTextNL: !!textNL,
      hasAnswer1: !!answer1,
      hasAnswer2: !!answer2,
      hasAnswer3: !!answer3,
      correctAnswer
    });

    // التحقق من البيانات
    if (!category || !textNL || !answer1 || !answer2 || !answer3 || !correctAnswer) {
      return NextResponse.json({
        success: false,
        message: "يجب إدخال جميع البيانات المطلوبة"
      }, { status: 400 });
    }

    const categoryUpper = category.toUpperCase();

    // حفظ الصور
    const imageUrls: string[] = [];
    const uploadDir = join(process.cwd(), "public", "uploads");
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    for (const image of images) {
      if (image && image.size > 0) {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${image.name.replace(/\s/g, '_')}`;
        const filepath = join(uploadDir, filename);
        
        await writeFile(filepath, buffer);
        imageUrls.push(`/uploads/${filename}`);
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
      text: text || textNL,
      textNL: textNL,
      imageUrls: imageUrls,
      audioUrl: audioUrl,
      answer1: answer1,
      answer2: answer2,
      answer3: answer3,
      correctAnswer: correctAnswer
    };

    if (categoryUpper === "A") {
      question = await prisma.examA.create({ data: questionData });
    } else if (categoryUpper === "B") {
      question = await prisma.examB.create({ data: questionData });
    } else if (categoryUpper === "C") {
      question = await prisma.examC.create({ data: questionData });
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
    const category = searchParams.get("category");

    if (!id || !category) {
      return NextResponse.json({
        success: false,
        message: "معرف السؤال والفئة مطلوبان"
      }, { status: 400 });
    }

    const categoryUpper = category.toUpperCase();
    let deleted = false;

    if (categoryUpper === "A") {
      await prisma.examA.delete({ where: { id } });
      deleted = true;
    } else if (categoryUpper === "B") {
      await prisma.examB.delete({ where: { id } });
      deleted = true;
    } else if (categoryUpper === "C") {
      await prisma.examC.delete({ where: { id } });
      deleted = true;
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
