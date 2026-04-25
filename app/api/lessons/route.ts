import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const questionType = searchParams.get("questionType");

    if (!categoryParam) {
      return NextResponse.json({ success: false, message: "category required" }, { status: 400 });
    }

    let category = categoryParam.toUpperCase();
    if (category.startsWith("EXAM")) {
      category = category.replace("EXAM", "");
    }

    const whereCondition: any = {};
    if (questionType) {
      whereCondition.questionType = questionType;
    }

    let lessons;
    if (category === "A") {
      lessons = await prisma.lessonA.findMany({ where: whereCondition, orderBy: { id: 'asc' } });
    } else if (category === "B") {
      lessons = await prisma.lessonB.findMany({ where: whereCondition, orderBy: { id: 'asc' } });
    } else if (category === "C") {
      lessons = await prisma.lessonC.findMany({ where: whereCondition, orderBy: { id: 'asc' } });
    } else {
      return NextResponse.json({ success: false, message: `Invalid category: ${category}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, lessons });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Error fetching lessons", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category } = body;
    const id = typeof body.id === "string" ? parseInt(body.id) : body.id;
    
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
