import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Ã·» «·œ—Ê” Õ”» «·›∆…
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const questionType = searchParams.get("questionType");

    if (!categoryParam) {
      return NextResponse.json({
        success: false,
        message: "ÌÃ»  ÕœÌœ «·›∆…"
      }, { status: 400 });
    }

    //  ÕÊÌ· «·›∆… ≈·Ï √Õ—› ﬂ»Ì—… ·· √ﬂœ „‰ «· Ê«›ﬁ
    // ≈–« ﬂ«‰  «·›∆…  »œ√ »‹ "exam" ‰” Œ—Ã «·Õ—› („À· examA -> A)
    let category = categoryParam.toUpperCase();
    if (category.startsWith("EXAM")) {
      category = category.replace("EXAM", "");
    }

    console.log(`?? Fetching lessons for category: ${category} (original: ${categoryParam}), questionType: ${questionType || 'all'}`);

    let lessons;

    // »‰«¡ ‘—ÿ «·›· —
    const whereCondition: any = {};
    if (questionType) {
      whereCondition.questionType = questionType;
    }
    // ≈–« ·„ Ì „  ÕœÌœ questionType° ‰Ã·» Ã„Ì⁄ «·œ—Ê” »œÊ‰ ›· —

    // Ã·» «·œ—Ê” „‰ «·ÃœÊ· «·„‰«”» Õ”» «·›∆…
    if (category === "A") {
      lessons = await prisma.lessonA.findMany({
        where: whereCondition,
        orderBy: {
          id: 'asc'
        }
      });
    } else if (category === "B") {
      lessons = await prisma.lessonB.findMany({
        where: whereCondition,
        orderBy: {
          id: 'asc'
        }
      });
    } else if (category === "C") {
      lessons = await prisma.lessonC.findMany({
        where: whereCondition,
        orderBy: {
          id: 'asc'
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `›∆… €Ì— ’ÕÌÕ…: ${category}`
      }, { status: 400 });
    }

    console.log(`? Found ${lessons.length} lessons for category ${category}`);

    return NextResponse.json({
      success: true,
      lessons: lessons
    });

  } catch (error) {
    console.error("? Error fetching lessons:", error);
    return NextResponse.json({
      success: false,
      message: "Œÿ√ ›Ì Ã·» «·œ—Ê”",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// POST - ≈÷«›… œ—” ÃœÌœ
export async function POST(request: NextRequest) {
  try {
    const { title, description, category } = await request.json();
    if (!title || !category) return NextResponse.json({ success: false, message: "title and category required" }, { status: 400 });

    const cat = category.toUpperCase();
    let lesson;
    if (cat === "A") lesson = await prisma.lessonA.create({ data: { title, description: description || null } });
    else if (cat === "B") lesson = await prisma.lessonB.create({ data: { title, description: description || null } });
    else if (cat === "C") lesson = await prisma.lessonC.create({ data: { title, description: description || null } });
    else return NextResponse.json({ success: false, message: "Invalid category" }, { status: 400 });

    return NextResponse.json({ success: true, lesson });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error creating lesson", error: String(error) }, { status: 500 });
  }
}

// DELETE - Õ–› œ—”
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "");
    const category = (searchParams.get("category") || "").toUpperCase();

    if (!id || !category) return NextResponse.json({ success: false, message: "id and category required" }, { status: 400 });

    if (category === "A") await prisma.lessonA.delete({ where: { id } });
    else if (category === "B") await prisma.lessonB.delete({ where: { id } });
    else if (category === "C") await prisma.lessonC.delete({ where: { id } });
    else return NextResponse.json({ success: false, message: "Invalid category" }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error deleting lesson", error: String(error) }, { status: 500 });
  }
}

// PUT -  ⁄œÌ· ⁄‰Ê«‰ œ—”
export async function PUT(request: NextRequest) {
  try {
    const { id, title, description, category } = await request.json();
    if (!id || !title || !category) return NextResponse.json({ success: false, message: "id, title and category required" }, { status: 400 });

    const cat = category.toUpperCase();
    let lesson;
    if (cat === "A") lesson = await prisma.lessonA.update({ where: { id }, data: { title, description: description || null } });
    else if (cat === "B") lesson = await prisma.lessonB.update({ where: { id }, data: { title, description: description || null } });
    else if (cat === "C") lesson = await prisma.lessonC.update({ where: { id }, data: { title, description: description || null } });
    else return NextResponse.json({ success: false, message: "Invalid category" }, { status: 400 });

    return NextResponse.json({ success: true, lesson });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error updating lesson", error: String(error) }, { status: 500 });
  }
}
