import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, verifyAdminCredentials } from "@/lib/adminAuth";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip, 10, 60000)) {
    return NextResponse.json({ success: false, message: "Too many requests. Try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password required" }, { status: 400 });
    }

    if (verifyAdminCredentials(email, password)) {
      return NextResponse.json({ success: true, role: "admin", email: "admin" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        subscriptions: {
          where: { isActive: true, expiryDate: { gt: new Date() } }
        }
      }
    });

    if (user && user.password === password) {
      // إنشاء session token جديد - يُبطل أي جلسة سابقة
      const sessionToken = randomBytes(32).toString("hex");
      await prisma.user.update({
        where: { id: user.id },
        data: { sessionToken }
      });

      const activeSubscriptions = user.subscriptions.map(sub => ({
        type: sub.subscriptionType,
        category: sub.category,
        examCategory: sub.examCategory,
        expiryDate: sub.expiryDate.getTime()
      }));
      const primarySub = activeSubscriptions[0] || null;
      return NextResponse.json({
        success: true, role: "student",
        cat: primarySub ? primarySub.category : user.category,
        email: user.email,
        subscriptionType: primarySub ? primarySub.type : (user.subscriptionType || "theorie"),
        examCategory: user.examCategory,
        exp: primarySub ? primarySub.expiryDate : user.expiryDate.getTime(),
        subscriptions: activeSubscriptions,
        sessionToken, // نرسله للمتصفح
      });
    }

    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
