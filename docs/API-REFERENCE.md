# 🔌 مرجع API - S & A Rijacademie

## 📋 جدول المحتويات

- [المستخدمين والاشتراكات](#المستخدمين-والاشتراكات)
- [الدفع](#الدفع)
- [الامتحانات](#الامتحانات)
- [الدروس](#الدروس)
- [الأدمن](#الأدمن)

---

## 👤 المستخدمين والاشتراكات

### POST `/api/subscribe`

إنشاء مستخدم جديد واشتراك.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "phone": "+32123456789",
  "category": "B",
  "subscriptionType": "theorie",
  "expiry": 1708473600000,
  "paymentMethod": "bancontact",
  "forceRenew": false
}
```

**Response (Success):**
```json
{
  "success": true,
  "email": "john@example.com",
  "cat": "B",
  "subscriptionType": "theorie",
  "examCategory": null,
  "exp": 1708473600000
}
```

**Response (Already Subscribed):**
```json
{
  "success": false,
  "message": "لديك بالفعل اشتراك نشط في هذه الفئة!",
  "alreadySubscribed": true,
  "email": "john@example.com",
  "cat": "B",
  "subscriptionType": "theorie",
  "exp": 1708473600000
}
```

---

### POST `/api/check-subscription`

التحقق من حالة اشتراك المستخدم.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "expired": false,
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "category": "B",
    "subscriptionType": "theorie",
    "expiryDate": "2026-02-20T12:00:00.000Z",
    "status": "active"
  }
}
```

---

### POST `/api/login`

تسجيل دخول المستخدم.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "email": "john@example.com",
    "name": "John Doe",
    "category": "B",
    "expiryDate": "2026-02-20T12:00:00.000Z"
  }
}
```

---

## 💳 الدفع

### POST `/api/create-payment`

إنشاء دفعة جديدة عبر Mollie.

**Request Body:**
```json
{
  "amount": 25,
  "email": "john@example.com",
  "description": "Driving School - theorie",
  "subscriptionType": "theorie",
  "category": "B",
  "redirectUrl": "http://localhost:3000/payment-success",
  "method": "bancontact"
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": "tr_WDqYK6vllg",
  "checkoutUrl": "https://www.mollie.com/checkout/...",
  "method": "bancontact"
}
```

---

### POST `/api/payment-webhook`

استقبال إشعارات الدفع من Mollie.

**Request Body:**
```json
{
  "id": "tr_WDqYK6vllg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed and subscription activated"
}
```

---

### POST `/api/check-payment-status`

التحقق من حالة الدفع.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "paid": true,
  "subscription": {
    "type": "theorie",
    "category": "B",
    "expiryDate": "2026-02-20T12:00:00.000Z"
  }
}
```

---

## 📝 الامتحانات

### POST `/api/exam-results`

حفظ نتيجة امتحان.

**Request Body:**
```json
{
  "userEmail": "john@example.com",
  "lessonTitle": "Traffic Signs",
  "category": "B",
  "score": 45,
  "totalQuestions": 50,
  "percentage": 90,
  "passed": true,
  "answers": [
    {
      "questionId": 1,
      "userAnswer": 2,
      "correctAnswer": 2,
      "isCorrect": true
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "id": 1,
    "score": 45,
    "totalQuestions": 50,
    "percentage": 90,
    "passed": true,
    "completedAt": "2026-02-20T12:00:00.000Z"
  }
}
```

---

### GET `/api/exam-results?email=john@example.com`

جلب نتائج امتحانات المستخدم.

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": 1,
      "lessonTitle": "Traffic Signs",
      "category": "B",
      "score": 45,
      "totalQuestions": 50,
      "percentage": 90,
      "passed": true,
      "completedAt": "2026-02-20T12:00:00.000Z"
    }
  ]
}
```

---

## 📚 الدروس

### GET `/api/lessons?category=B&type=Theori`

جلب الدروس حسب الفئة والنوع.

**Response:**
```json
{
  "success": true,
  "lessons": [
    {
      "id": 1,
      "title": "Traffic Signs",
      "category": "B",
      "questionType": "Theori",
      "description": "Learn about traffic signs",
      "videoUrl": "https://...",
      "questions": [
        {
          "id": 1,
          "text": "What does this sign mean?",
          "imageUrls": ["https://..."],
          "answer1": "Stop",
          "answer2": "Yield",
          "answer3": "Go",
          "correctAnswer": 1
        }
      ]
    }
  ]
}
```

---

### GET `/api/questions?lessonId=1`

جلب أسئلة درس معين.

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "id": 1,
      "text": "What does this sign mean?",
      "imageUrls": ["https://..."],
      "audioUrl": null,
      "answer1": "Stop",
      "answer2": "Yield",
      "answer3": "Go",
      "correctAnswer": 1
    }
  ]
}
```

---

## 👨‍💼 الأدمن

### GET `/api/admin/subscribers`

جلب قائمة المشتركين (للأدمن فقط).

**Response:**
```json
{
  "success": true,
  "subscribers": [
    {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "phone": "+32123456789",
      "category": "B",
      "subscriptionType": "theorie",
      "expiryDate": "2026-02-20T12:00:00.000Z",
      "status": "active",
      "createdAt": "2026-02-01T12:00:00.000Z",
      "subscriptions": [
        {
          "id": 1,
          "subscriptionType": "theorie",
          "category": "B",
          "expiryDate": "2026-02-20T12:00:00.000Z",
          "isActive": true
        }
      ]
    }
  ]
}
```

---

### POST `/api/contact`

إرسال رسالة اتصال.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I have a question about..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

---

## 🔐 المصادقة

حالياً، النظام يستخدم:
- **localStorage** لحفظ بيانات المستخدم
- **Email + Password** للتسجيل والدخول
- **لا يوجد JWT** (يمكن إضافته لاحقاً)

---

## ⚠️ ملاحظات مهمة

1. **جميع الـ APIs تقبل JSON فقط**
2. **يجب إرسال `Content-Type: application/json`**
3. **الأخطاء تُرجع بصيغة:**
   ```json
   {
     "success": false,
     "message": "Error message here"
   }
   ```
4. **التواريخ بصيغة ISO 8601**
5. **الأسعار بالـ EUR**

---

## 🧪 اختبار الـ APIs

### باستخدام curl:

```bash
# تسجيل مستخدم جديد
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "phone": "+32123456789",
    "category": "B",
    "subscriptionType": "theorie",
    "expiry": 1708473600000,
    "paymentMethod": "bancontact"
  }'

# التحقق من الاشتراك
curl -X POST http://localhost:3000/api/check-subscription \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

**آخر تحديث:** 20 فبراير 2026
