# دليل نظام الدفع المحدث

## نظرة عامة
تم تحديث نظام الدفع ليمنع الوصول إلى المحتوى قبل تأكيد الدفع. النظام يدعم 3 طرق دفع:

1. **Bancontact** - بطاقات الدفع البلجيكية
2. **QR Code** - الدفع عبر مسح رمز QR
3. **PayPal** - الدفع الإلكتروني

## كيفية العمل

### 1. عملية التسجيل والدفع

#### الخطوة 1: ملء نموذج الاشتراك
- المستخدم يملأ البيانات (الاسم، البريد، كلمة المرور، الهاتف)
- يختار طريقة الدفع
- يضغط على زر الإرسال

#### الخطوة 2: حفظ البيانات
- يتم حفظ بيانات المستخدم في قاعدة البيانات
- **لا يتم تفعيل الاشتراك بعد**
- حالة الاشتراك: `pending` (في انتظار الدفع)

#### الخطوة 3: عملية الدفع

##### أ. Bancontact / PayPal
1. يفتح رابط بوابة الدفع في نافذة جديدة
2. المستخدم يكمل الدفع
3. بوابة الدفع ترسل webhook للسيرفر
4. السيرفر يفعّل الاشتراك
5. المستخدم يُعاد توجيهه للمحتوى

##### ب. QR Code
1. يظهر modal مع رمز QR
2. المستخدم يمسح الرمز بتطبيق الدفع
3. يكمل الدفع في التطبيق
4. النظام يتحقق من حالة الدفع كل 5 ثواني
5. عند تأكيد الدفع، يتم تفعيل الاشتراك تلقائياً
6. المستخدم يُعاد توجيهه للمحتوى

### 2. التحقق من حالة الدفع

#### API Endpoint
```
POST /api/check-payment-status
```

#### Request Body
```json
{
  "email": "user@example.com"
}
```

#### Response (لم يتم الدفع)
```json
{
  "success": true,
  "paid": false,
  "message": "Payment not confirmed yet"
}
```

#### Response (تم الدفع)
```json
{
  "success": true,
  "paid": true,
  "subscription": {
    "type": "theorie",
    "category": "B",
    "expiryDate": "2024-03-15T10:00:00.000Z"
  }
}
```

### 3. Webhook للتأكيد

#### Endpoint
```
POST /api/payment-webhook
```

#### Request Body (من بوابة الدفع)
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

#### ما يحدث عند استلام Webhook
1. التحقق من صحة البيانات
2. البحث عن المستخدم في قاعدة البيانات
3. تفعيل الاشتراك (تحديث حالة الدفع)
4. إرسال بريد تأكيد (اختياري)

## إعداد بوابات الدفع

### Bancontact

#### 1. التسجيل
- سجل في [Bancontact Payment Services](https://www.bancontact.com/)
- احصل على Merchant ID و API Key

#### 2. إعداد Webhook
```
Webhook URL: https://yourdomain.com/api/payment-webhook
Events: payment.completed, payment.failed
```

#### 3. متغيرات البيئة
```env
BANCONTACT_MERCHANT_ID=your_merchant_id
BANCONTACT_API_KEY=your_api_key
BANCONTACT_WEBHOOK_SECRET=your_webhook_secret
```

### Payconiq (QR Code)

#### 1. التسجيل
- سجل في [Payconiq for Business](https://www.payconiq.be/)
- احصل على Merchant ID

#### 2. إعداد QR Code
```typescript
// مثال على إنشاء QR Code
const paymentData = {
  merchantId: process.env.PAYCONIQ_MERCHANT_ID,
  amount: 2500, // بالسنت (25 يورو)
  currency: "EUR",
  reference: `PAY_${Date.now()}`,
  description: "Driving School Subscription"
};

const qrData = JSON.stringify(paymentData);
```

#### 3. متغيرات البيئة
```env
PAYCONIQ_MERCHANT_ID=your_merchant_id
PAYCONIQ_API_KEY=your_api_key
```

### PayPal

#### 1. التسجيل
- سجل في [PayPal Developer](https://developer.paypal.com/)
- أنشئ تطبيق جديد

#### 2. إعداد Webhooks
```
Webhook URL: https://yourdomain.com/api/payment-webhook
Events: PAYMENT.CAPTURE.COMPLETED
```

#### 3. متغيرات البيئة
```env
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_WEBHOOK_ID=your_webhook_id
```

## حماية المحتوى

### 1. التحقق من الاشتراك قبل الوصول

كل صفحة محتوى يجب أن تتحقق من:
- وجود بريد المستخدم في localStorage
- صلاحية الاشتراك (لم ينتهي)
- تأكيد الدفع

```typescript
useEffect(() => {
  const checkAccess = async () => {
    const email = localStorage.getItem("userEmail");
    
    if (!email) {
      router.push("/"); // إعادة توجيه للصفحة الرئيسية
      return;
    }

    const res = await fetch("/api/check-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    
    if (!data.success || data.expired) {
      router.push("/"); // الاشتراك منتهي
    }
  };

  checkAccess();
}, []);
```

### 2. حماية API Routes

```typescript
// في كل API route للمحتوى
export async function GET(req: NextRequest) {
  const email = req.headers.get("x-user-email");
  
  if (!email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { subscriptions: true },
  });

  if (!user || !hasActiveSubscription(user)) {
    return NextResponse.json(
      { error: "No active subscription" },
      { status: 403 }
    );
  }

  // إرجاع المحتوى
}
```

## QR Code Implementation

### استخدام مكتبة qrcode.react

#### 1. التثبيت
```bash
npm install qrcode.react
```

#### 2. الاستخدام في CheckoutForm
```typescript
import QRCode from "qrcode.react";

// في الـ component
<QRCode
  value={qrCodeData}
  size={256}
  level="H"
  includeMargin={true}
  renderAs="svg"
/>
```

## اختبار النظام

### 1. اختبار محلي

#### اختبار QR Code
```bash
# تشغيل السيرفر
npm run dev

# في المتصفح
1. افتح http://localhost:3000
2. اختر اشتراك
3. اختر QR Code كطريقة دفع
4. املأ النموذج واضغط إرسال
5. يجب أن يظهر QR Code
```

#### محاكاة Webhook
```bash
curl -X POST http://localhost:3000/api/payment-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "qr_scan",
    "transactionId": "TEST_123",
    "status": "completed",
    "email": "test@example.com",
    "amount": 25.00
  }'
```

### 2. اختبار التحقق من الدفع
```bash
curl -X POST http://localhost:3000/api/check-payment-status \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## الأمان

### 1. التحقق من Webhook Signature
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

### 2. IP Whitelist
```typescript
const ALLOWED_IPS = [
  '185.56.96.0/22', // Bancontact
  '52.18.0.0/16',   // PayPal
  // أضف IPs بوابات الدفع
];

function isAllowedIP(ip: string): boolean {
  return ALLOWED_IPS.some(range => ipInRange(ip, range));
}
```

## التطوير المستقبلي

### ميزات مقترحة
1. ✅ منع الوصول قبل الدفع
2. ✅ QR Code للدفع
3. ✅ التحقق التلقائي من حالة الدفع
4. 🔄 إشعارات البريد الإلكتروني
5. 🔄 لوحة تحكم المدفوعات للأدمن
6. 🔄 نظام استرجاع المبلغ
7. 🔄 تقارير مالية

### إضافة جدول المدفوعات
```prisma
model Payment {
  id              Int      @id @default(autoincrement())
  transactionId   String   @unique
  userId          Int
  user            User     @relation(fields: [userId], references: [id])
  amount          Float
  currency        String   @default("EUR")
  paymentMethod   String
  status          String   // pending, completed, failed, refunded
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## الدعم الفني

### مشاكل شائعة

#### 1. QR Code لا يظهر
- تحقق من console للأخطاء
- تأكد من تثبيت مكتبة qrcode.react
- تحقق من صحة البيانات في qrCodeData

#### 2. Webhook لا يعمل
- تحقق من URL الصحيح
- تأكد من استخدام HTTPS في الإنتاج
- راجع logs السيرفر
- تحقق من IP whitelist

#### 3. المستخدم يصل للمحتوى قبل الدفع
- تحقق من التحقق في كل صفحة
- راجع API protection
- تأكد من عدم حفظ بيانات الاشتراك في localStorage قبل الدفع

## ملاحظات مهمة

⚠️ **تذكر:**
- لا تحفظ بيانات الاشتراك في localStorage قبل تأكيد الدفع
- استخدم HTTPS في الإنتاج
- احفظ جميع secrets في متغيرات البيئة
- راقب logs الـ webhook بانتظام
- اختبر جميع سيناريوهات الدفع
- أضف timeout للتحقق من الدفع (10 دقائق)
