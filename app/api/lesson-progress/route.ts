import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, isValidEmail } from "@/lib/adminAuth";

// ── GET: جلب تقدم المستخدم وملاحظاته ─────────────────────────────────────────
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(ip, 60, 60000)) {
    return NextResponse.json({ success: false }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.toLowerCase().trim();
  const category = searchParams.get("category");

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ success: false, message: "Invalid email" }, { status: 400 });
  }

  try {
    const [progressRows, noteRows] = await Promise.all([
      prisma.lessonProgress.findMany({
        where: { userEmail: email, ...(category ? { category } : {}) },
        select: { lessonId: true, category: true, completedAt: true },
      }),
      prisma.lessonNote.findMany({
        where: { userEmail: email, ...(category ? { category } : {}) },
        select: { lessonId: true, category: true, content: true },
      }),
    ]);

    // تحويل إلى map سهل الاستخدام في الفرونت
    const completed: Record<string, string> = {};
    for (const p of progressRows) {
      if (p.completedAt) {
        completed[String(p.lessonId)] = p.completedAt.toISOString();
      }
    }

    const notes: Record<string, string> = {};
    for (const n of noteRows) {
      notes[String(n.lessonId)] = n.content;
    }

    return NextResponse.json({ success: true, completed, notes });
  } catch (error) {
    console.error("GET lesson-progress error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// ── POST: حفظ إنجاز درس أو ملاحظة ───────────────────────────────────────────
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(ip, 30, 60000)) {
    return NextResponse.json({ success: false }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { email, lessonId, category, action, note } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ success: false, message: "Invalid email" }, { status: 400 });
    }
    if (!lessonId || !category) {
      return NextResponse.json({ success: false, message: "lessonId and category required" }, { status: 400 });
    }

    const userEmail = String(email).toLowerCase().trim();
    const lid = Number(lessonId);
    const cat = String(category);

    // التحقق من وجود المستخدم
    const user = await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true } });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // ── حفظ إنجاز الدرس ──
    if (action === "complete" || action === "uncomplete") {
      await prisma.lessonProgress.upsert({
        where: { userEmail_lessonId_category: { userEmail, lessonId: lid, category: cat } },
        create: {
          userEmail,
          lessonId: lid,
          category: cat,
          completedAt: action === "complete" ? new Date() : null,
        },
        update: {
          completedAt: action === "complete" ? new Date() : null,
        },
      });
      return NextResponse.json({ success: true });
    }

    // ── حفظ ملاحظة ──
    if (action === "note") {
      const content = typeof note === "string" ? note.slice(0, 5000) : "";
      await prisma.lessonNote.upsert({
        where: { userEmail_lessonId_category: { userEmail, lessonId: lid, category: cat } },
        create: { userEmail, lessonId: lid, category: cat, content },
        update: { content },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST lesson-progress error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
