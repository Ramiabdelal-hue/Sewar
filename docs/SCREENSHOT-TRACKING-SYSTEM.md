# نظام تتبع محاولات Screenshot

## نظرة عامة
تم إضافة نظام شامل لتتبع ومراقبة محاولات المشتركين لأخذ لقطات شاشة (Screenshots) من المحتوى المحمي.

## الميزات الرئيسية

### 1. تتبع تلقائي لمحاولات Screenshot
- يتم تسجيل كل محاولة لأخذ screenshot تلقائياً
- يتم حفظ التفاصيل التالية لكل محاولة:
  - البريد الإلكتروني للمشترك
  - التاريخ والوقت الدقيق
  - الصفحة التي تمت فيها المحاولة
  - عنوان IP

### 2. عرض عدد المحاولات في لوحة الأدمن
في صفحة `/admin/subscribers`:
- عمود جديد "📸 Screenshots" يعرض عدد المحاولات لكل مشترك
- زر قابل للنقر لعرض التفاصيل الكاملة
- تلوين تحذيري:
  - برتقالي: 1-3 محاولات
  - أحمر نابض: أكثر من 3 محاولات

### 3. تحذيرات أمنية للأدمن
- **بانر تحذيري أحمر** يظهر تلقائياً في أعلى الصفحة عند وجود مشتركين مشبوهين
- يعرض:
  - عدد المشتركين الذين تجاوزوا 3 محاولات
  - قائمة بأسمائهم وبريدهم الإلكتروني ورقم الهاتف
  - عدد المحاولات لكل مشترك
- البانر يظهر بشكل نابض (animate-pulse) لجذب الانتباه

### 4. نافذة تفاصيل المحاولات
عند النقر على زر عدد المحاولات، تظهر نافذة منبثقة تحتوي على:

#### معلومات المشترك:
- الاسم الكامل
- البريد الإلكتروني
- رقم الهاتف
- نوع الاشتراك

#### تفاصيل كل محاولة:
- التاريخ والوقت بالتفصيل (سنة، شهر، يوم، ساعة، دقيقة، ثانية)
- الصفحة التي تمت فيها المحاولة
- عنوان IP
- ترقيم المحاولات (1، 2، 3، ...)
- تمييز المحاولات المشبوهة (أكثر من 3) بلون أحمر وعلامة تحذير

## التقنيات المستخدمة

### 1. Frontend (React/Next.js)
```typescript
// في app/admin/subscribers/page.tsx
interface SubscriptionRow {
  // ... الحقول الأخرى
  screenshotDetails?: {
    count: number;
    attempts: Array<{
      date: string;
      page: string;
      ip: string;
    }>;
  };
}
```

### 2. Backend API
```typescript
// في app/api/admin/subscribers/route.ts
// جلب محاولات Screenshot من قاعدة البيانات
const allScreenshots = await prisma.activityLog.findMany({
  where: {
    eventType: 'screenshot_attempt',
    userEmail: { in: users.map(u => u.email) }
  }
});

// حساب المشتركين المشبوهين
const suspiciousUsers = subscriptionRows.filter(
  row => row.screenshotDetails?.count > 3
);
```

### 3. تسجيل المحاولات
```typescript
// في components/ScreenProtection.tsx
const logScreenshotAttempt = async () => {
  await fetch("/api/activity", {
    method: "POST",
    body: JSON.stringify({
      userEmail: localStorage.getItem("userEmail"),
      eventType: "screenshot_attempt",
      page: window.location.pathname
    })
  });
};
```

## قاعدة البيانات

### جدول ActivityLog
```prisma
model ActivityLog {
  id          Int      @id @default(autoincrement())
  userEmail   String?
  eventType   String   // "screenshot_attempt"
  page        String?
  userAgent   String?
  ip          String?
  createdAt   DateTime @default(now())
}
```

## كيفية الاستخدام

### للأدمن:
1. افتح صفحة `/admin/subscribers`
2. إذا كان هناك مشتركون مشبوهون، سترى بانر تحذيري أحمر في الأعلى
3. في جدول المشتركين، انظر إلى عمود "📸 Screenshots"
4. انقر على الزر لعرض التفاصيل الكاملة

### التحذيرات:
- ⚠️ **أكثر من 3 محاولات**: يعتبر سلوك مشبوه
- يجب متابعة هؤلاء المشتركين
- يمكن التواصل معهم عبر البريد الإلكتروني أو الهاتف

## الأمان والخصوصية

### ما يتم تسجيله:
✅ البريد الإلكتروني (للمشتركين المسجلين فقط)
✅ التاريخ والوقت
✅ الصفحة
✅ عنوان IP

### ما لا يتم تسجيله:
❌ محتوى الشاشة
❌ معلومات شخصية إضافية
❌ بيانات المتصفح الحساسة

## الأحداث التي تُسجل كمحاولة Screenshot

1. **Print Screen Key**: عند الضغط على زر Print Screen
2. **Visibility Change**: عند تغيير visibility (Alt+Tab أو أدوات screenshot)
3. **Keyboard Shortcuts**: محاولات استخدام اختصارات لوحة المفاتيح

## التحسينات المستقبلية المقترحة

1. **إشعارات فورية**: إرسال إشعار للأدمن عند تجاوز 3 محاولات
2. **تقارير دورية**: تقرير أسبوعي/شهري بالمحاولات
3. **حظر تلقائي**: خيار لحظر المشترك تلقائياً بعد عدد معين من المحاولات
4. **تصدير البيانات**: تصدير تقرير Excel بالمحاولات
5. **رسوم بيانية**: عرض إحصائيات بصرية للمحاولات

## الملفات المعدلة

1. `app/admin/subscribers/page.tsx` - واجهة الأدمن
2. `app/api/admin/subscribers/route.ts` - API للحصول على البيانات
3. `components/ScreenProtection.tsx` - تسجيل المحاولات
4. `prisma/schema.prisma` - جدول ActivityLog (موجود مسبقاً)

## الاختبار

### لاختبار النظام:
1. سجل دخول كمشترك
2. حاول أخذ screenshot (Print Screen)
3. سجل دخول كأدمن
4. افتح `/admin/subscribers`
5. تحقق من ظهور المحاولة في العمود الجديد

## الدعم الفني

إذا واجهت أي مشاكل:
1. تحقق من أن `ActivityLog` يعمل بشكل صحيح
2. تأكد من أن `localStorage.getItem("userEmail")` يحتوي على البريد الإلكتروني
3. راجع console logs في المتصفح
4. تحقق من API response في Network tab

---

**تاريخ الإنشاء**: 2026-04-22
**الإصدار**: 1.0.0
**الحالة**: ✅ جاهز للإنتاج
