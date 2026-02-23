# نظام الاشتراكات المتعددة

## نظرة عامة
تم تحديث النظام ليدعم اشتراكات متعددة للمستخدم الواحد. الآن يمكن للمستخدم أن يكون مشتركاً في:
- دروس نظرية لفئة معينة (A, B, أو C)
- امتحانات لفئة معينة (A, B, أو C)
- دروس عملية (فيديوهات)
- امتحانات عملية (إدراك المخاطر)

كل ذلك في نفس الوقت!

## التغييرات في قاعدة البيانات

### جدول Subscription الجديد
```prisma
model Subscription {
  id               Int      @id @default(autoincrement())
  userId           Int
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscriptionType String   // نوع الاشتراك: theorie, examen, praktijk-lessons, praktijk-exam
  category         String   // الفئة: A, B, C
  examCategory     String?  // فئة الامتحان: examTestA, examTestB, examTestC
  expiryDate       DateTime // تاريخ انتهاء هذا الاشتراك
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  
  @@unique([userId, subscriptionType, category]) // منع التكرار
}
```

### تحديث جدول User
- تمت إضافة علاقة `subscriptions` مع جدول Subscription
- الحقول القديمة (category, subscriptionType, examCategory, expiryDate) محفوظة للتوافق مع الكود القديم

## كيفية عمل النظام

### 1. عند الاشتراك الجديد
```typescript
// في app/api/subscribe/route.ts
// يتم إنشاء/تحديث سجل في جدول User (للتوافق)
// + إنشاء/تحديث سجل في جدول Subscription (النظام الجديد)

await prisma.subscription.upsert({
  where: {
    userId_subscriptionType_category: {
      userId: user.id,
      subscriptionType: "examen",
      category: "A"
    }
  },
  update: { expiryDate, isActive: true },
  create: { userId, subscriptionType, category, expiryDate }
});
```

### 2. عند تسجيل الدخول
```typescript
// في app/api/login/route.ts
// يتم جلب المستخدم مع جميع اشتراكاته النشطة

const user = await prisma.user.findUnique({
  where: { email },
  include: {
    subscriptions: {
      where: {
        isActive: true,
        expiryDate: { gt: new Date() }
      }
    }
  }
});

// إرجاع جميع الاشتراكات النشطة
return {
  subscriptions: user.subscriptions.map(sub => ({
    type: sub.subscriptionType,
    category: sub.category,
    expiryDate: sub.expiryDate.getTime()
  }))
};
```

### 3. في LoginModal
عند تسجيل الدخول:

**إذا كان لديه اشتراك واحد فقط:**
- يتم التوجيه مباشرة إلى الصفحة المناسبة

**إذا كان لديه اشتراكات متعددة:**
- يتم عرض قائمة بجميع الاشتراكات النشطة
- المستخدم يختار الاشتراك الذي يريد الدخول إليه
- يتم التوجيه إلى الصفحة المناسبة

## أمثلة على الاستخدام

### مثال 1: مستخدم مشترك في دروس نظرية فئة B فقط
```json
{
  "subscriptions": [
    {
      "type": "theorie",
      "category": "B",
      "expiryDate": 1740000000000
    }
  ]
}
```
**النتيجة:** توجيه مباشر إلى `/lessons?cat=B&user=...`

### مثال 2: مستخدم مشترك في دروس نظرية B + امتحانات A
```json
{
  "subscriptions": [
    {
      "type": "theorie",
      "category": "B",
      "expiryDate": 1740000000000
    },
    {
      "type": "examen",
      "category": "A",
      "examCategory": "examTestA",
      "expiryDate": 1740000000000
    }
  ]
}
```
**النتيجة:** عرض قائمة اختيار:
- دروس نظرية - فئة B
- امتحانات - فئة A

### مثال 3: مستخدم مشترك في كل شيء
```json
{
  "subscriptions": [
    {
      "type": "theorie",
      "category": "B",
      "expiryDate": 1740000000000
    },
    {
      "type": "examen",
      "category": "B",
      "examCategory": "examTestB",
      "expiryDate": 1740000000000
    },
    {
      "type": "praktijk-lessons",
      "category": "B",
      "expiryDate": 1740000000000
    },
    {
      "type": "praktijk-exam",
      "category": "B",
      "expiryDate": 1740000000000
    }
  ]
}
```
**النتيجة:** عرض قائمة اختيار بجميع الخيارات الأربعة

## واجهة اختيار الاشتراك

عند وجود اشتراكات متعددة، يتم عرض:
- عنوان الاشتراك (مثل: "دروس نظرية - فئة B")
- تاريخ انتهاء الاشتراك
- زر للدخول إلى الاشتراك

التصميم:
- بطاقات جميلة بتدرج برتقالي
- تأثيرات hover وانتقالات سلسة
- دعم كامل للغات الثلاث (AR, NL, FR)

## الفوائد

1. **مرونة كاملة**: المستخدم يمكنه الاشتراك في أي عدد من الخدمات
2. **تواريخ انتهاء منفصلة**: كل اشتراك له تاريخ انتهاء خاص به
3. **سهولة الإدارة**: يمكن تفعيل/تعطيل اشتراكات معينة
4. **تجربة مستخدم ممتازة**: اختيار سهل وواضح عند تسجيل الدخول
5. **توافق مع الكود القديم**: النظام القديم يعمل بدون مشاكل

## Migration
تم إنشاء migration:
- `20260220050605_add_multiple_subscriptions`
- يضيف جدول Subscription
- يضيف علاقة بين User و Subscription

## ملاحظات مهمة

1. **منع التكرار**: لا يمكن للمستخدم الاشتراك في نفس النوع والفئة مرتين
2. **الاشتراكات النشطة فقط**: يتم عرض الاشتراكات التي لم تنتهي صلاحيتها فقط
3. **التوافق**: الكود القديم يعمل بشكل طبيعي
4. **الأداء**: استعلام واحد فقط لجلب جميع الاشتراكات

## الخطوات التالية (اختياري)

1. إضافة صفحة "اشتراكاتي" لعرض جميع الاشتراكات
2. إضافة إشعارات قبل انتهاء الاشتراك
3. إضافة إمكانية التبديل بين الاشتراكات من Navbar
4. إضافة تقارير للمشتركين في كل نوع
