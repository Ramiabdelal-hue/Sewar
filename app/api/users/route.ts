import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newUser = await prisma.user.create({
      data: {
        email: body.email.toLowerCase().trim(),
        name: body.fullName,
        password: body.password,
        phone: body.phone || "",
        category: body.category,
        paymentType: body.paymentMethod,
        expiryDate: new Date(body.expiry),
        status: "active",
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        email: newUser.email,
        cat: newUser.category,
        exp: newUser.expiryDate.getTime()
      }
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
