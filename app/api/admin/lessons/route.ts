import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// دالة مساعدة لجلب الدروس مباشرة من DB (بدون cache)
async function getLessonsFromDB(category: string) {
  const orderBy = { id: "asc" as const };
  if (category === "A") return prisma.lessonA.findMany({ orderBy });
  if (category === "B") return prisma.lessonB.findMany({ orderBy });
  if (category === "C") return prisma.lessonC.findMany({ orderBy });
  return [];
}

// GET - جلب الدروس (بدون cache للأدمن)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category") || "";
    const cat = categoryParam.toUpperCase();

    if (!["A", "B", "C"].includes(cat)) {
      return NextResponse.json({ success: false, message: "category must be A, B, or C" }, { status: 400 });
    }

    const lessons = await getLessonsFromDB(cat);
    return NextResponse.json({ success: true, lessons }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (error) {
    console.error("GET /api/admin/lessons:", error);
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}

// POST - إضافة درس جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category } = body;

    if (!title?.trim() || !category) {
      return NextResponse.json({ success: false, message: "title and category required" }, { status: 400 });
    }

    const cat = category.toUpperCase();
    let lesson;

    if (cat === "A") {
      lesson = await prisma.lessonA.create({ data: { title: title.trim(), description: description?.trim() || null } });
    } else if (cat === "B") {
      lesson = await prisma.lessonB.create({ data: { title: title.trim(), description: description?.trim() || null } });
    } else if (cat === "C") {
      lesson = await prisma.lessonC.create({ data: { title: title.trim(), description: description?.trim() || null } });
    } else {
      return NextResponse.json({ success: false, message: "Invalid category" }, { status: 400 });
    }

    return NextResponse.json({ success: true, lesson }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("POST /api/admin/lessons:", error);
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}

// PUT - تعديل درس
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category } = body;
    const id = typeof body.id === "string" ? parseInt(body.id) : Number(body.id);

    if (!id || !title?.trim() || !category) {
      return NextResponse.json({ success: false, message: "id, title and category required" }, { status: 400 });
    }

    const cat = category.toUpperCase();
    let lesson;

    if (cat === "A") {
      lesson = await prisma.lessonA.update({ where: { id }, data: { title: title.trim(), description: description?.trim() || null } });
    } else if (cat === "B") {
      lesson = await prisma.lessonB.update({ where: { id }, data: { title: title.trim(), description: description?.trim() || null } });
    } else if (cat === "C") {
      lesson = await prisma.lessonC.update({ where: { id }, data: { title: title.trim(), description: description?.trim() || null } });
    } else {
      return NextResponse.json({ success: false, message: "Invalid category" }, { status: 400 });
    }

    return NextResponse.json({ success: true, lesson }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("PUT /api/admin/lessons:", error);
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}

// DELETE - حذف درس (مع جميع أسئلته بسبب onDelete: Cascade)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0");
    const cat = (searchParams.get("category") || "").toUpperCase();

    if (!id || !cat) {
      return NextResponse.json({ success: false, message: "id and category required" }, { status: 400 });
    }

    if (cat === "A") {
      await prisma.lessonA.delete({ where: { id } });
    } else if (cat === "B") {
      await prisma.lessonB.delete({ where: { id } });
    } else if (cat === "C") {
      await prisma.lessonC.delete({ where: { id } });
    } else {
      return NextResponse.json({ success: false, message: "Invalid category" }, { status: 400 });
    }

    return NextResponse.json({ success: true }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("DELETE /api/admin/lessons:", error);
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}
