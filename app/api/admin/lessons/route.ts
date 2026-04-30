/**
 * Admin Lessons API
 * Pattern: thin route → service → DB
 */
import { NextRequest, NextResponse } from "next/server";
import { getLessons, createLesson, updateLesson, deleteLesson } from "@/lib/services/lesson.service";
import { validateLesson, validateLessonUpdate } from "@/lib/validators/lesson";
import { rateLimits } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/adminAuth";

const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate" };

// GET — جلب الدروس بدون cache
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimits.api(ip);
    if (!rl.allowed) {
      return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
    }

    const cat = (request.nextUrl.searchParams.get("category") || "").toUpperCase() as "A" | "B" | "C";
    if (!["A", "B", "C"].includes(cat)) {
      return NextResponse.json({ success: false, message: "category must be A, B, or C" }, { status: 400 });
    }

    const lessons = await getLessons(cat);
    return NextResponse.json({ success: true, lessons }, { headers: NO_CACHE });
  } catch (error) {
    console.error("GET /api/admin/lessons:", error);
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}

// POST — إضافة درس
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimits.api(ip);
    if (!rl.allowed) {
      return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const validation = validateLesson(body);
    if (!validation.valid) {
      return NextResponse.json({ success: false, errors: validation.errors }, { status: 400 });
    }

    const { title, description, category } = validation.data;
    const lesson = await createLesson(category as "A" | "B" | "C", title, description);
    return NextResponse.json({ success: true, lesson }, { headers: NO_CACHE });
  } catch (error) {
    console.error("POST /api/admin/lessons:", error);
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}

// PUT — تعديل درس
export async function PUT(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimits.api(ip);
    if (!rl.allowed) {
      return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const validation = validateLessonUpdate(body);
    if (!validation.valid) {
      return NextResponse.json({ success: false, errors: validation.errors }, { status: 400 });
    }

    const { id, title, description, category } = validation.data;
    const lesson = await updateLesson(category as "A" | "B" | "C", id, title, description);
    return NextResponse.json({ success: true, lesson }, { headers: NO_CACHE });
  } catch (error) {
    console.error("PUT /api/admin/lessons:", error);
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}

// DELETE — حذف درس
export async function DELETE(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimits.api(ip);
    if (!rl.allowed) {
      return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
    }

    const id = parseInt(request.nextUrl.searchParams.get("id") || "0");
    const cat = (request.nextUrl.searchParams.get("category") || "").toUpperCase() as "A" | "B" | "C";

    if (!id || !["A", "B", "C"].includes(cat)) {
      return NextResponse.json({ success: false, message: "id and valid category required" }, { status: 400 });
    }

    await deleteLesson(cat, id);
    return NextResponse.json({ success: true }, { headers: NO_CACHE });
  } catch (error) {
    console.error("DELETE /api/admin/lessons:", error);
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}
