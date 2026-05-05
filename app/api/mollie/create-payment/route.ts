import { NextRequest, NextResponse } from "next/server";
import { createMollieClient } from "@mollie/api-client";
import { checkRateLimit, getClientIp } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip, 10, 600000)) {
    return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const {
      amount,        // المبلغ بالأرقام مثل 25.00
      description,   // وصف الاشتراك
      email,         // بريد المشترك
      metadata,      // بيانات إضافية (category, subscriptionType, etc.)
    } = body;

    if (!amount || !email) {
      return NextResponse.json({ success: false, message: "amount and email required" }, { status: 400 });
    }

    const apiKey = process.env.MOLLIE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, message: "Mollie not configured" }, { status: 500 });
    }

    // ── فحص الاشتراك النشط قبل إنشاء الدفعة ──────────────────────────────
    const { prisma } = await import("@/lib/prisma");
    const category   = body.metadata?.category || "B";
    const subType    = body.metadata?.subscriptionType || "theorie";
    const emailNorm  = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({ where: { email: emailNorm } });
    if (existingUser) {
      const now = new Date();
      const activeSub = await prisma.subscription.findUnique({
        where: {
          userId_subscriptionType_category: {
            userId: existingUser.id,
            subscriptionType: subType,
            category,
          },
        },
      });
      if (activeSub && activeSub.isActive && new Date(activeSub.expiryDate) > now) {
        const daysLeft = Math.ceil((new Date(activeSub.expiryDate).getTime() - now.getTime()) / 86400000);
        return NextResponse.json({
          success: false,
          alreadySubscribed: true,
          daysLeft,
          message: `لديك اشتراك نشط في ${subType} فئة ${category} — متبقي ${daysLeft} يوم`,
        }, { status: 409 });
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    const mollie = createMollieClient({ apiKey });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sewar-1q112.vercel.app";

    const payment = await mollie.payments.create({
      amount: {
        currency: "EUR",
        value: Number(amount).toFixed(2),
      },
      description: description || "Sewar Rijbewijs Online — Abonnement",
      redirectUrl: `${baseUrl}/payment-success?email=${encodeURIComponent(email)}`,
      webhookUrl: `${baseUrl}/api/mollie/webhook`,
      metadata: {
        email,
        ...metadata,
      },
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      checkoutUrl: payment._links.checkout?.href,
    });
  } catch (error: any) {
    console.error("❌ Mollie create payment error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Payment creation failed" },
      { status: 500 }
    );
  }
}
