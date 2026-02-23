# نظام تصنيف الامتحانات المنفصل

## التغييرات المطبقة

### 1. قاعدة البيانات (Prisma Schema)
تم إضافة حقل جديد `examCategory` في جدول User:

```prisma
model User {
  id               Int           @id @default(autoincrement())
  email            String        @unique
  name             String
  password         String
  phone            String?
  category         String        // الفئة العامة: A, B, C
  paymentType      String
  subscriptionType String?       // نوع الاشتراك: lessons, practical, exams
  examCategory     String?       // فئة الامتحانات: examTestA, examTestB, examTestC
  expiryDate       DateTime
  status           String
  createdAt        DateTime      @default(now())
  examResults      ExamResult[]
}
```

### 2. API الاشتراك (app/api/subscribe/route.ts)
- عند الاشتراك في الامتحانات (`subscriptionType === "examen"`)، يتم تعيين `examCategory` تلقائياً
- مثال: إذا اشترك المستخدم في فئة A للامتحانات، سيتم حفظ `examCategory = "examTestA"`

```typescript
let examCategory = null;
if (body.subscriptionType === "examen") {
  examCategory = `examTest${body.category}`; // examTestA, examTestB, examTestC
}
```

### 3. API التحقق من الاشتراك (app/api/check-subscription/route.ts)
- تم إضافة `examCategory` في الاستجابة
- يمكن للصفحات الآن التحقق من نوع اشتراك الامتحان

### 4. API تسجيل الدخول (app/api/login/route.ts)
- تم إضافة `examCategory` في الاستجابة عند تسجيل الدخول
- يتم حفظها في localStorage للاستخدام في الصفحات

## كيفية الاستخدام

### عند الاشتراك:
1. المستخدم يختار فئة الامتحان (A, B, أو C)
2. النظام يحفظ:
   - `category`: "A" أو "B" أو "C"
   - `subscriptionType`: "examen"
   - `examCategory`: "examTestA" أو "examTestB" أو "examTestC"

### عند التحقق من الصلاحية:
```javascript
const response = await fetch("/api/check-subscription", {
  method: "POST",
  body: JSON.stringify({ email: userEmail })
});

const data = await response.json();
console.log(data.user.examCategory); // examTestA, examTestB, أو examTestC
```

### في الصفحات:
```javascript
// التحقق من نوع الاشتراك
if (user.subscriptionType === "examen") {
  // المستخدم مشترك في الامتحانات
  console.log("فئة الامتحان:", user.examCategory); // examTestA, examTestB, examTestC
}

if (user.subscriptionType === "theorie") {
  // المستخدم مشترك في الدروس النظرية
}

if (user.subscriptionType === "praktijk-lessons" || user.subscriptionType === "praktijk-exam") {
  // المستخدم مشترك في الدروس العملية
}
```

## الفوائد

1. **تصنيف واضح**: كل نوع اشتراك له تصنيف خاص
2. **سهولة التحقق**: يمكن التحقق من نوع الاشتراك بسهولة
3. **مرونة**: يمكن إضافة أنواع اشتراكات جديدة بسهولة
4. **تقارير دقيقة**: يمكن عمل تقارير منفصلة لكل نوع اشتراك

## Migration
تم إنشاء migration تلقائياً:
- `20260220045613_add_exam_category`
- يضيف حقل `examCategory` (nullable) لجدول User

## ملاحظات
- الحقل `examCategory` اختياري (nullable) لأنه يستخدم فقط مع اشتراكات الامتحانات
- المستخدمون القدامى لن يتأثروا (الحقل سيكون null)
- يمكن تحديث المستخدمين القدامى لاحقاً إذا لزم الأمر
