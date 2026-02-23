# دليل إعداد Mollie للدفع الحقيقي

## 🚀 خطوات سريعة للبدء

### 1. إنشاء حساب Mollie

1. اذهب إلى: https://www.mollie.com/be
2. اضغط "Sign up" (التسجيل مجاني)
3. املأ بيانات الشركة
4. فعّل الحساب

### 2. الحصول على API Key

1. سجل دخول إلى: https://www.mollie.com/dashboard
2. اذهب إلى: **Developers** → **API keys**
3. انسخ **Test API key** (يبدأ بـ `test_`)
4. للإنتاج: انسخ **Live API key** (يبدأ بـ `live_`)

### 3. تثبيت Mollie SDK

```bash
npm install @mollie/api-client
```

### 4. إضافة المفاتيح إلى .env

أضف هذه الأسطر إلى ملف `.env`:

```env
# Mollie API Keys
MOLLIE_API_KEY=test_dHar4XY7LxsDOtmnkVtjNVWXLSlXsM

# Base URL (مهم جداً!)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# للإنتاج غيّر إلى:
# NEXT_PUBLIC_BASE_URL=https://yourdomain.com
# MOLLIE_API_KEY=live_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. تحديث CheckoutForm

أضف هذا الكود في `components/CheckoutForm.tsx` داخل دالة `handleSubmit`:

```typescript
if (formData.paymentMethod === "bancontact") {
  // إنشاء دفعة Mollie
  const paymentRes = await fetch("/api/create-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: duration === "2w" ? 25 : 50,
      email: formData.email,
      description: `Driving School - ${subscriptionType}`,
      subscriptionType: subscriptionType,
      category: targetCat,
      redirectUrl: `${window.location.origin}/payment-success?email=${encodeURIComponent(formData.email)}`,
    }),
  });

  const paymentData = await paymentRes.json();

  if (paymentData.success) {
    // إعادة توجيه المستخدم إلى صفحة الدفع
    window.location.href = paymentData.checkoutUrl;
  } else {
    alert(paymentData.message || "خطأ في إنشاء الدفع");
  }
  
  setLoading(false);
  return; // مهم: إيقاف التنفيذ هنا
}
```

### 6. إعادة تشغيل السيرفر

```bash
# أوقف السيرفر (Ctrl+C)
# ثم شغله مرة أخرى
npm run dev
```

## ✅ اختبار النظام

### في وضع الاختبار (Test Mode):

1. افتح الموقع: http://localhost:3000
2. اختر أي اشتراك
3. املأ النموذج
4. اختر Bancontact
5. اضغط "إرسال"
6. ستفتح صفحة Mollie للدفع
7. اضغط "Select your bank"
8. اختر أي بنك (في وضع الاختبار)
9. اضغط "Pay €25.00"
10. سيتم إعادة توجيهك لموقعك
11. سيتم تفعيل الاشتراك تلقائياً

### بطاقات اختبار:

في وضع الاختبار، يمكنك استخدام:
- **نجاح:** اختر أي بنك واضغط "Pay"
- **فشل:** اضغط "Cancel" أو أغلق الصفحة

## 📱 كيف يعمل على الموبايل

1. المستخدم يضغط "إرسال"
2. يفتح صفحة Mollie
3. يختار البنك
4. يضغط "Pay"
5. **يفتح تطبيق البنك تلقائياً** 📱
6. يؤكد الدفع في التطبيق
7. يعود للموقع تلقائياً
8. يتم تفعيل الاشتراك ✅

## 🔧 إعداد Webhook (مهم!)

### للتطوير المحلي (باستخدام ngrok):

```bash
# 1. ثبت ngrok
npm install -g ngrok

# 2. شغل ngrok
ngrok http 3000

# 3. انسخ URL (مثل: https://abc123.ngrok.io)

# 4. أضفه في .env
NEXT_PUBLIC_BASE_URL=https://abc123.ngrok.io

# 5. أعد تشغيل السيرفر
```

### للإنتاج:

1. اذهب إلى: https://www.mollie.com/dashboard/developers/webhooks
2. اضغط "Add webhook"
3. أدخل: `https://yourdomain.com/api/mollie-webhook`
4. احفظ

## 💰 الأسعار

### Mollie - Bancontact:
- **€0.29 + 1.29%** لكل معاملة
- **بدون رسوم شهرية**
- **بدون رسوم إعداد**

### أمثلة:
- اشتراك €25 → رسوم: €0.61 → صافي: €24.39
- اشتراك €50 → رسوم: €0.94 → صافي: €49.06

## 🚀 النشر للإنتاج

### 1. احصل على Live API Key

1. اذهب إلى: https://www.mollie.com/dashboard/developers/api-keys
2. انسخ **Live API key**

### 2. حدّث .env

```env
MOLLIE_API_KEY=live_xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 3. فعّل Bancontact

1. اذهب إلى: https://www.mollie.com/dashboard/settings/payment-methods
2. فعّل **Bancontact**
3. قد تحتاج لتقديم مستندات الشركة

### 4. اختبر على الإنتاج

استخدم بطاقة حقيقية للاختبار (ستُسترد الأموال)

## ⚠️ ملاحظات مهمة

1. **لا تشارك API Keys** - احتفظ بها سرية
2. **استخدم HTTPS** في الإنتاج
3. **اختبر جيداً** قبل النشر
4. **راجع الأسعار** على موقع Mollie
5. **احتفظ بنسخة احتياطية** من .env

## 🐛 حل المشاكل

### خطأ: "Mollie SDK not installed"
```bash
npm install @mollie/api-client
```

### خطأ: "Mollie API Key not configured"
تأكد من إضافة `MOLLIE_API_KEY` في ملف `.env`

### خطأ: "Webhook not working"
- تأكد من استخدام ngrok للتطوير المحلي
- تأكد من أن URL صحيح في إعدادات Mollie
- تحقق من logs السيرفر

### الدفع لا يعمل على الموبايل
- تأكد من أن تطبيق البنك مثبت
- تأكد من أن Bancontact مفعّل في حسابك
- جرب على متصفح مختلف

## 📞 الدعم

- **Mollie Support:** https://help.mollie.com
- **Documentation:** https://docs.mollie.com
- **Status:** https://status.mollie.com

## ✨ الخطوات التالية

بعد إعداد Mollie:

1. ✅ اختبر الدفع في وضع Test
2. ✅ تأكد من عمل Webhook
3. ✅ اختبر على الموبايل
4. ✅ احصل على Live API Key
5. ✅ انشر للإنتاج
6. ✅ اختبر بدفعة حقيقية صغيرة
7. ✅ ابدأ استقبال المدفوعات! 🎉
