import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, verifyAdminCredentials } from "@/lib/adminAuth";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";

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

    // Validate input lengths to prevent abuse
    if (typeof email !== "string" || email.length > 254 || typeof password !== "string" || password.length > 128) {
      return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
    }

    if (verifyAdminCredentials(email, password)) {
      return NextResponse.json({ success: true, role: "admin", email: "admin" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        subscriptions: {
          where: { isActive: true, expiryDate: { gt: new Date() } },
        },
      },
    });

    if (!user) {
      // Constant-time response to prevent user enumeration
      await bcrypt.compare(password, "$2b$10$invalidhashfortimingprotection000000000000000000000000");
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    // Support both bcrypt hashed and legacy plain-text passwords
    let passwordValid = false;
    const isHashed = user.password.startsWith("$2b$") || user.password.startsWith("$2a$");
    if (isHashed) {
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      // Legacy plain-text — compare then upgrade to hash
      passwordValid = user.password === password;
      if (passwordValid) {
        const hashed = await bcrypt.hash(password, 12);
        await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
      }
    }

    if (!passwordValid) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    // Check suspension
    if (user.status === "suspended") {
      return NextResponse.json({ success: false, suspended: true, message: "تم تعليق حسابك. تواصل معنا." }, { status: 403 });
    }

    // Create new session token — invalidates any previous session
    const sessionToken = randomBytes(32).toString("hex");
    await prisma.user.update({ where: { id: user.id }, data: { sessionToken } });

    const activeSubscriptions = user.subscriptions.map((sub) => ({
      type: sub.subscriptionType,
      category: sub.category,
      examCategory: sub.examCategory,
      expiryDate: sub.expiryDate.getTime(),
    }));
    const primarySub = activeSubscriptions[0] || null;

    return NextResponse.json({
      success: true,
      role: "student",
      cat: primarySub ? primarySub.category : user.category,
      email: user.email,
      subscriptionType: primarySub ? primarySub.type : (user.subscriptionType || "theorie"),
      examCategory: user.examCategory,
      exp: primarySub ? primarySub.expiryDate : user.expiryDate.getTime(),
      subscriptions: activeSubscriptions,
      sessionToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
