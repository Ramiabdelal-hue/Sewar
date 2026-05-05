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
