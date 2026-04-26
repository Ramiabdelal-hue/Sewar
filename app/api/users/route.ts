import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, unauthorizedResponse, isValidEmail } from "@/lib/adminAuth";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  // Only admin can create users directly
  if (!verifyAdminToken(req)) return unauthorizedResponse();

  try {
    const body = await req.json();

    if (!isValidEmail(body.email)) {
      return NextResponse.json({ success: false, message: "Invalid email" }, { status: 400 });
    }
    if (!body.fullName || !body.password || !body.category) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(String(body.password), 12);

    const newUser = await prisma.user.create({
      data: {
        email: body.email.toLowerCase().trim(),
        name: String(body.fullName).slice(0, 100),
        password: hashedPassword,
        phone: body.phone ? String(body.phone).slice(0, 20) : "",
        category: ["A", "B", "C"].includes(body.category) ? body.category : "B",
        paymentType: String(body.paymentMethod || "cash").slice(0, 50),
        expiryDate: new Date(body.expiry),
        status: "active",
      },
    });

    return NextResponse.json({
      success: true,
      user: { email: newUser.email, cat: newUser.category, exp: newUser.expiryDate.getTime() },
    });
  } catch (error: any) {
    console.error("Create user error:", error.message);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
