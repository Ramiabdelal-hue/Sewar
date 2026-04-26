import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, isValidEmail } from "@/lib/adminAuth";

// حفظ نتيجة امتحان
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(ip, 20, 60000)) {
    return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();

    const { userEmail, lessonTitle, category, score, totalQuestions, answers } = body;

    if (!isValidEmail(userEmail) || !lessonTitle || !category || score === undefined || !totalQuestions || !answers) {
      return NextResponse.json({ success: false, message: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    // Validate numeric values
    if (typeof score !== "number" || typeof totalQuestions !== "number" || score < 0 || totalQuestions <= 0) {
      return NextResponse.json({ success: false, message: "Invalid score values" }, { status: 400 });
    }

    // Validate category
    if (!["A", "B", "C"].includes(String(category).toUpperCase())) {
      return NextResponse.json({ success: false, message: "Invalid category" }, { status: 400 });
    }

    const percentage = (score / totalQuestions) * 100;
    const passed = percentage >= 70;

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
    }

    const result = await prisma.examResult.create({
      data: {
        userEmail,
        lessonTitle: String(lessonTitle).slice(0, 200),
        category: String(category).toUpperCase().slice(0, 1),
        score,
        totalQuestions,
        percentage,
        passed,
        answers,
      },
    });

    return NextResponse.json({ success: true, result });

  } catch (error) {
    console.error("Error saving exam result:", error);
    return NextResponse.json({ success: false, message: "خطأ في حفظ النتيجة" }, { status: 500 });
  }
}

// جلب نتائج المستخدم — يتطلب session token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("email");
    const sessionToken = searchParams.get("session");

    if (!userEmail || !isValidEmail(userEmail)) {
      return NextResponse.json({ success: false, message: "البريد الإلكتروني مطلوب" }, { status: 400 });
    }

    // Verify session token to prevent fetching other users' results
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail.toLowerCase().trim() } });
    if (!user || user.sessionToken !== sessionToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const results = await prisma.examResult.findMany({
      where: { userEmail: userEmail.toLowerCase().trim() },
      orderBy: { completedAt: "desc" },
      take: 100, // limit results
    });

    return NextResponse.json({ success: true, results });

  } catch (error) {
    console.error("Error fetching exam results:", error);
    return NextResponse.json({ success: false, message: "خطأ في جلب النتائج" }, { status: 500 });
  }
}
