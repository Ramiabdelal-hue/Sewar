import { NextRequest, NextResponse } from "next/server";
import { createMollieClient } from "@mollie/api-client";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendSubscriptionConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const paymentId = body.get("id") as string;

    if (!paymentId) {
      return NextResponse.json({ error: "No payment ID" }, { status: 400 });
    }

    const apiKey = process.env.MOLLIE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Mollie not configured" }, { status: 500 });
    }

    const mollie = createMollieClient({ apiKey });
    const payment = await mollie.payments.get(paymentId);

    console.log(`📦 Mollie webhook: payment ${paymentId} status = ${payment.status}`);

    // فقط نعالج الدفعات المكتملة
    if (payment.status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const meta = payment.metadata as any;
    const email = meta?.email?.toLowerCase().trim();
    const fullName = meta?.fullName || "مشترك";
    const password = meta?.password || "";
    const phone = meta?.phone || "";
    const category = meta?.category || "B";
    const subscriptionType = meta?.subscriptionType || "theorie";
    const duration = meta?.duration || "2w";
    const paymentMethod = meta?.paymentMethod || "bancontact";

    if (!email) {
      console.error("❌ No email in payment metadata");
      return NextResponse.json({ error: "No email" }, { status: 400 });
    }

    // حساب تاريخ الانتهاء
    const expiryDate = new Date();
    if (duration === "1m") {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      expiryDate.setDate(expiryDate.getDate() + 14);
    }

    // إنشاء أو تحديث المستخدم
    const hashedPassword = password ? await bcrypt.hash(password, 12) : await bcrypt.hash("default123", 12);

    let examCategory = null;
    if (subscriptionType === "examen") {
      examCategory = `examTest${category}`;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    let user;
    if (existingUser) {
      user = await prisma.user.update({
        where: { email },
        data: {
          name: fullName,
          password: hashedPassword,
          phone,
          category,
          paymentType: paymentMethod,
          subscriptionType,
          examCategory,
          expiryDate,
          status: "active",
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          name: fullName,
          password: hashedPassword,
          phone,
          category,
          paymentType: paymentMethod,
          subscriptionType,
          examCategory,
          expiryDate,
          status: "active",
        },
      });
    }

    // إضافة الاشتراك
    await prisma.subscription.upsert({
      where: {
        userId_subscriptionType_category: {
          userId: user.id,
          subscriptionType,
          category,
        },
      },
      update: { expiryDate, examCategory, isActive: true },
      create: {
        userId: user.id,
        subscriptionType,
        category,
        examCategory,
        expiryDate,
        isActive: true,
      },
    });

    // حساب المبلغ
    const amountPaid = parseFloat(payment.amount.value);
    const invoiceNumber = `INV-${Date.now()}-${user.id}`;

    // إرسال إيميل التأكيد مع الفاتورة
    await sendSubscriptionConfirmationEmail({
      toEmail: email,
      userName: fullName,
      subscriptionType,
      category,
      duration,
      amount: amountPaid,
      expiryDate,
      paymentMethod,
      invoiceNumber,
    });

    console.log(`✅ Subscription activated for ${email} via Mollie payment ${paymentId}`);
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("❌ Mollie webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Mollie يرسل GET أحياناً للتحقق
export async function GET() {
  return NextResponse.json({ ok: true });
}
