# دمج Bancontact الحقيقي مع Mollie

## 📋 المتطلبات

1. **حساب Mollie** - سجل على https://www.mollie.com/be
2. **API Key** - احصل على مفتاح API من لوحة التحكم
3. **تثبيت Mollie SDK**

## 🚀 خطوات التنفيذ

### الخطوة 1: تثبيت Mollie SDK

```bash
npm install @mollie/api-client
```

### الخطوة 2: إضافة API Key إلى .env

```env
MOLLIE_API_KEY=test_xxxxxxxxxxxxxxxxxxxxxxxxxx
# للإنتاج استخدم: live_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### الخطوة 3: إنشاء API لإنشاء الدفع

**ملف جديد:** `app/api/create-payment/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createMollieClient } from "@mollie/api-client";

const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { amount, email, description, redirectUrl } = await req.json();

    // إنشاء دفعة Bancontact
    const payment = await mollieClient.payments.create({
      amount: {
        currency: "EUR",
        value: amount.toFixed(2), // مثل: "25.00"
      },
      description: description || "Driving School Subscription",
      redirectUrl: redirectUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
      webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mollie-webhook`,
      method: "bancontact",
      metadata: {
        email: email,
        subscriptionType: "theorie", // يمكن تمريره من الطلب
      },
    });

    console.log("✅ Payment created:", payment.id);

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      checkoutUrl: payment.getCheckoutUrl(), // رابط الدفع
    });
  } catch (error: any) {
    console.error("❌ Error creating payment:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
```

### الخطوة 4: إنشاء Webhook لاستقبال إشعارات الدفع

**ملف جديد:** `app/api/mollie-webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createMollieClient } from "@mollie/api-client";
import { prisma } from "@/lib/prisma";

const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const paymentId = body.id;

    console.log("🔔 Mollie webhook received for payment:", paymentId);

    // جلب تفاصيل الدفع من Mollie
    const payment = await mollieClient.payments.get(paymentId);

    console.log("💳 Payment status:", payment.status);
    console.log("📧 Payment metadata:", payment.metadata);

    // التحقق من حالة الدفع
    if (payment.status === "paid") {
      const email = payment.metadata.email as string;

      // البحث عن المستخدم
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // تفعيل الحساب
        await prisma.user.update({
          where: { email },
          data: { status: "active" },
        });

        // تفعيل جميع الاشتراكات المعلقة
        await prisma.subscription.updateMany({
          where: {
            userId: user.id,
            isActive: false,
          },
          data: { isActive: true },
        });

        console.log("✅ User subscription activated:", email);
      }
    } else if (payment.status === "failed" || payment.status === "canceled") {
      console.log("❌ Payment failed or canceled");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
```

### الخطوة 5: تحديث CheckoutForm

**ملف:** `components/CheckoutForm.tsx`

```typescript
// في handleSubmit، بعد نجاح API subscribe:

if (formData.paymentMethod === "bancontact") {
  // إنشاء دفعة Mollie
  const paymentRes = await fetch("/api/create-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: duration === "2w" ? 25 : 50,
      email: formData.email,
      description: `Driving School - ${subscriptionType}`,
      redirectUrl: `${window.location.origin}/payment-success?email=${encodeURIComponent(formData.email)}`,
    }),
  });

  const paymentData = await paymentRes.json();

  if (paymentData.success) {
    // إعادة توجيه المستخدم إلى صفحة الدفع
    window.location.href = paymentData.checkoutUrl;
  } else {
    alert("خطأ في إنشاء الدفع");
  }
}
```

### الخطوة 6: إنشاء صفحة نجاح الدفع

**ملف جديد:** `app/payment-success/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const email = searchParams.get("email");

    if (!email) {
      router.push("/");
      return;
    }

    // التحقق من حالة الدفع
    const checkPayment = async () => {
      const res = await fetch("/api/check-payment-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.paid) {
        // حفظ البيانات في localStorage
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userCategory", data.subscription.category);
        localStorage.setItem("userExpiry", data.subscription.expiryDate);

        // إعادة التوجيه للمحتوى
        setTimeout(() => {
          router.push("/theorie");
        }, 2000);
      } else {
        // لم يتم تأكيد الدفع بعد، انتظر قليلاً
        setTimeout(checkPayment, 2000);
      }
    };

    checkPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md">
        <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-4">
          تم الدفع بنجاح!
        </h1>
        <p className="text-gray-600 mb-6">
          جاري تفعيل اشتراكك...
        </p>
        <div className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>
    </div>
  );
}
```

### الخطوة 7: تحديث .env

```env
# Mollie API Keys
MOLLIE_API_KEY=test_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Base URL (للإنتاج)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# للتطوير المحلي
# NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🔄 سير العمل الكامل

```
1. المستخدم يملأ النموذج ويختار Bancontact
2. يضغط "إرسال"
3. ✅ يتم حفظ البيانات بحالة "pending"
4. 🔄 يتم إنشاء دفعة في Mollie
5. 🚀 يتم إعادة توجيه المستخدم لصفحة Bancontact
6. 📱 المستخدم يفتح تطبيق البنك ويدفع
7. ✅ Mollie يرسل webhook للسيرفر
8. ✅ يتم تفعيل الاشتراك
9. 🔙 المستخدم يعود لموقعك
10. ✅ يتم حفظ البيانات في localStorage
11. 🎉 يتم إعادة التوجيه للمحتوى
```

## 💰 التكاليف

### Mollie
- **رسوم المعاملة:** €0.29 + 1.29% لكل معاملة Bancontact
- **بدون رسوم شهرية**
- **بدون رسوم إعداد**

### مثال:
- اشتراك €25 → رسوم Mollie: €0.29 + (€25 × 1.29%) = €0.61
- صافي الربح: €24.39

## 🧪 الاختبار

### وضع الاختبار (Test Mode)
1. استخدم `test_` API key
2. استخدم بطاقات اختبار Mollie
3. لن يتم سحب أموال حقيقية

### بطاقات اختبار Bancontact
- **نجاح:** استخدم أي رقم IBAN بلجيكي
- **فشل:** استخدم IBAN غير صالح

## 🚀 النشر للإنتاج

1. **احصل على Live API Key** من Mollie
2. **غيّر في .env:**
   ```env
   MOLLIE_API_KEY=live_xxxxxxxxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   ```
3. **تأكد من إعداد Webhook URL** في لوحة تحكم Mollie:
   ```
   https://yourdomain.com/api/mollie-webhook
   ```

## 📱 تجربة المستخدم

### على الموبايل:
1. المستخدم يضغط "إرسال"
2. يفتح صفحة Bancontact
3. يضغط "Pay with Bancontact"
4. يفتح تطبيق البنك تلقائياً
5. يؤكد الدفع في التطبيق
6. يعود للموقع تلقائياً
7. يتم تفعيل الاشتراك

### على الكمبيوتر:
1. المستخدم يضغط "إرسال"
2. يفتح صفحة Bancontact
3. يمسح QR Code بتطبيق البنك
4. يؤكد الدفع
5. يعود للموقع
6. يتم تفعيل الاشتراك

## 🔒 الأمان

- ✅ لا يتم تخزين معلومات بطاقات
- ✅ جميع المعاملات مشفرة (PCI DSS)
- ✅ Mollie معتمد من البنك المركزي الأوروبي
- ✅ دعم 3D Secure

## 📞 الدعم

- **Mollie Support:** https://help.mollie.com
- **Documentation:** https://docs.mollie.com
- **Status Page:** https://status.mollie.com

## ⚠️ ملاحظات مهمة

1. **لا يمكن اختبار Bancontact محلياً** بدون ngrok أو domain حقيقي
2. **Webhook يجب أن يكون HTTPS** في الإنتاج
3. **احتفظ بـ API Keys آمنة** - لا تشاركها أبداً
4. **راجع الأسعار** على موقع Mollie قبل البدء

## 🎯 البدائل الأخرى

### Stripe
- يدعم Bancontact أيضاً
- رسوم مشابهة لـ Mollie
- واجهة أكثر تعقيداً

### PayPlug
- متخصص في أوروبا
- رسوم أقل قليلاً
- دعم أقل

### Adyen
- للشركات الكبيرة
- رسوم شهرية
- ميزات متقدمة

## 🏁 الخلاصة

**الخيار الموصى به:** Mollie
- سهل التكامل
- رسوم معقولة
- دعم ممتاز
- شائع في بلجيكا
- يدعم جميع طرق الدفع البلجيكية
