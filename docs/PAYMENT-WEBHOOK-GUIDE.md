# دليل استخدام Payment Webhook

## نظرة عامة
تم إضافة نظام webhook لاستقبال إشعارات الدفع من بوابات الدفع الثلاثة:
1. **Bancontact** - بطاقات الدفع البلجيكية
2. **Payconiq** - الدفع عبر QR Code
3. **PayPal** - الدفع الإلكتروني

## كيفية العمل

### 1. عملية الدفع
عند إكمال نموذج الدفع:
1. يتم حفظ بيانات المستخدم في قاعدة البيانات
2. يتم فتح بوابة الدفع المختارة في نافذة جديدة
3. المستخدم يكمل عملية الدفع في البوابة
4. بوابة الدفع ترسل إشعار webhook إلى السيرفر
5. يتم تأكيد الدفع وتحديث حالة الاشتراك

### 2. Webhook Endpoint
```
POST /api/payment-webhook
```

### 3. البيانات المطلوبة في Webhook

#### Bancontact
```json
{
  "paymentMethod": "bancontact",
  "transactionId": "BCT_123456789",
  "status": "completed",
  "email": "user@example.com",
  "amount": 25.00,
  "currency": "EUR"
}
```

#### Payconiq (QR Code)
```json
{
  "paymentMethod": "qr_scan",
  "transactionId": "PYQ_987654321",
  "status": "success",
  "email": "user@example.com",
  "amount": 25.00,
  "currency": "EUR"
}
```

#### PayPal
```json
{
  "paymentMethod": "paypal",
  "transactionId": "PAY_ABCDEF123",
  "status": "paid",
  "email": "user@example.com",
  "amount": 25.00,
  "currency": "EUR"
}
```

## إعداد بوابات الدفع

### Bancontact
1. سجل في [Bancontact Payment Services](https://www.bancontact.com/)
2. احصل على API credentials
3. أضف webhook URL: `https://yourdomain.com/api/payment-webhook`
4. قم بتكوين الإشعارات لإرسال:
   - Transaction ID
   - Status
   - Customer Email
   - Amount

### Payconiq
1. سجل في [Payconiq for Business](https://www.payconiq.be/)
2. احصل على Merchant ID
3. أضف webhook URL في لوحة التحكم
4. فعّل إشعارات الدفع الناجح

### PayPal
1. سجل في [PayPal Developer](https://developer.paypal.com/)
2. أنشئ تطبيق جديد
3. في إعدادات Webhooks، أضف:
   - URL: `https://yourdomain.com/api/payment-webhook`
   - Events: `PAYMENT.CAPTURE.COMPLETED`
4. احفظ Webhook ID و Secret

## اختبار الـ Webhook

### اختبار محلي
```bash
# تشغيل السيرفر
npm run dev

# اختبار الـ webhook
curl -X POST http://localhost:3000/api/payment-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "bancontact",
    "transactionId": "TEST_123",
    "status": "completed",
    "email": "test@example.com",
    "amount": 25.00
  }'
```

### التحقق من حالة الـ Webhook
```bash
curl http://localhost:3000/api/payment-webhook
```

## الأمان

### التحقق من صحة الـ Webhook
يُنصح بإضافة التحقق من:
1. **Signature Verification** - التحقق من توقيع الطلب
2. **IP Whitelist** - السماح فقط لـ IPs بوابات الدفع
3. **Timestamp Validation** - التحقق من وقت الطلب

### مثال على التحقق من التوقيع
```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## حالات الدفع

| Status | الوصف | الإجراء |
|--------|-------|---------|
| `completed` / `success` / `paid` | دفع ناجح | تفعيل الاشتراك |
| `pending` | قيد المعالجة | انتظار التأكيد |
| `failed` | فشل الدفع | إشعار المستخدم |
| `cancelled` | ألغى المستخدم | لا إجراء |
| `refunded` | استرجاع المبلغ | إلغاء الاشتراك |

## التطوير المستقبلي

### ميزات مقترحة
1. **جدول المدفوعات** - إضافة جدول `Payment` في Prisma
2. **إشعارات البريد** - إرسال تأكيد بالبريد الإلكتروني
3. **لوحة تحكم المدفوعات** - عرض سجل المدفوعات للأدمن
4. **استرجاع المبلغ** - نظام لمعالجة الاسترجاعات
5. **تقارير مالية** - تقارير شهرية للمدفوعات

### إضافة جدول المدفوعات في Prisma
```prisma
model Payment {
  id              Int      @id @default(autoincrement())
  transactionId   String   @unique
  userId          Int
  user            User     @relation(fields: [userId], references: [id])
  amount          Float
  currency        String   @default("EUR")
  paymentMethod   String
  status          String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## الدعم الفني
للمساعدة أو الأسئلة:
- راجع وثائق بوابات الدفع
- تحقق من logs السيرفر
- اختبر الـ webhook محلياً أولاً

## ملاحظات مهمة
⚠️ **تذكر:**
- استخدم HTTPS في الإنتاج
- احفظ API secrets في متغيرات البيئة
- راقب logs الـ webhook بانتظام
- اختبر جميع حالات الدفع
- أضف معالجة للأخطاء
