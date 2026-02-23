# نظام الاشتراكات حسب الفئة

## نظرة عامة

تم تحديث النظام ليدعم الاشتراكات المتعددة حسب الفئة (A, B, C). كل مستخدم يمكنه الاشتراك في فئات مختلفة بشكل مستقل.

## البنية الأساسية

### قاعدة البيانات

#### جداول الدروس (منفصلة حسب الفئة):
- `LessonA` - دروس الدراجات النارية (Motorcycles)
- `LessonB` - دروس السيارات (Cars)
- `LessonC` - دروس الشاحنات (Trucks)

#### جداول الأسئلة (منفصلة حسب الفئة):
- `QuestionA` - أسئلة الفئة A
- `QuestionB` - أسئلة الفئة B
- `QuestionC` - أسئلة الفئة C

#### جدول الاشتراكات:
```prisma
model Subscription {
  id               Int      @id @default(autoincrement())
  userId           Int
  subscriptionType String   // "theorie", "praktijk-lessons", "praktijk-exam", "examen"
  category         String   // "A", "B", "C"
  examCategory     String?  // "examTestA", "examTestB", "examTestC"
  expiryDate       DateTime
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, subscriptionType, category])
}
```

## تدفق الاشتراك

### 1. اختيار الفئة
المستخدم يختار الفئة من صفحة `/theorie` أو `/examen`:
- الفئة A (Motorcycles)
- الفئة B (Cars)
- الفئة C (Trucks)

### 2. معالجة الدفع
في `CheckoutForm.tsx`:
```typescript
// تحديد الفئة بناءً على الاختيار
let targetCat = "B"; // القيمة الافتراضية
if (selectedCatId === "cat-c" || selectedCatId === "C") targetCat = "C";
else if (selectedCatId === "cat-a" || selectedCatId === "A") targetCat = "A";
else if (selectedCatId === "cat-b" || selectedCatId === "B") targetCat = "B";
```

### 3. حفظ الاشتراك
في `/api/subscribe`:
```typescript
// إنشاء أو تحديث الاشتراك
await prisma.subscription.upsert({
  where: {
    userId_subscriptionType_category: {
      userId: user.id,
      subscriptionType: body.subscriptionType || "theorie",
      category: body.category || "B"
    }
  },
  update: {
    expiryDate: expiryDate,
    examCategory: examCategory,
    isActive: true
  },
  create: {
    userId: user.id,
    subscriptionType: body.subscriptionType || "theorie",
    category: body.category || "B",
    examCategory: examCategory,
    expiryDate: expiryDate,
    isActive: true
  }
});
```

### 4. الوصول إلى المحتوى
بعد الدفع، يتم توجيه المستخدم إلى:
```
/lessons?cat={CATEGORY}&email={EMAIL}&exp={EXPIRY}
```

## جلب الدروس حسب الفئة

### API: `/api/lessons`
```typescript
// تحويل الفئة إلى أحرف كبيرة
const category = categoryParam.toUpperCase();

// جلب الدروس من الجدول المناسب
if (category === "A") {
  lessons = await prisma.lessonA.findMany({
    where: {
      OR: [
        { questionType: "Theori" },
        { questionType: null }
      ]
    },
    orderBy: { id: 'asc' }
  });
} else if (category === "B") {
  lessons = await prisma.lessonB.findMany({...});
} else if (category === "C") {
  lessons = await prisma.lessonC.findMany({...});
}
```

### صفحة الدروس: `/lessons/page.tsx`
```typescript
// جلب الفئة من URL
const cat = searchParams.get("cat");

// تحويل إلى أحرف كبيرة
const categoryUpper = cat.toUpperCase();

// جلب الدروس
const response = await fetch(`/api/lessons?category=${categoryUpper}`);
```

## جلب الأسئلة حسب الفئة

### API: `/api/questions`
```typescript
// تحديد الفئة من lessonId
const category = await getCategoryFromLessonId(lessonIdNum);

// جلب الأسئلة من الجدول المناسب
if (category === "A") {
  lessonRecord = await prisma.lessonA.findUnique({
    where: { id: lessonIdNum },
    include: { questions: {...} }
  });
} else if (category === "B") {
  lessonRecord = await prisma.lessonB.findUnique({...});
} else if (category === "C") {
  lessonRecord = await prisma.lessonC.findUnique({...});
}
```

## الاشتراكات المتعددة

المستخدم يمكنه الاشتراك في فئات متعددة:
- اشتراك في الفئة A (Motorcycles)
- اشتراك في الفئة B (Cars)
- اشتراك في الفئة C (Trucks)

كل اشتراك مستقل ويحتوي على:
- نوع الاشتراك (theorie, praktijk, examen)
- الفئة (A, B, C)
- تاريخ الانتهاء
- حالة التفعيل

## التحقق من الاشتراك

### API: `/api/check-subscription`
```typescript
// جلب جميع الاشتراكات النشطة
const user = await prisma.user.findUnique({
  where: { email: email.toLowerCase().trim() },
  include: {
    subscriptions: {
      where: {
        isActive: true,
        expiryDate: {
          gt: new Date() // فقط الاشتراكات النشطة
        }
      }
    }
  }
});
```

## تسجيل الدخول

### API: `/api/login`
```typescript
// استخدام الفئة من أول اشتراك نشط
const primaryCategory = activeSubscriptions.length > 0 
  ? activeSubscriptions[0].category 
  : user.category;

return NextResponse.json({
  success: true,
  role: "student",
  cat: primaryCategory,
  email: user.email,
  subscriptions: activeSubscriptions // جميع الاشتراكات النشطة
});
```

## العناوين حسب الفئة

في صفحة الدروس:
```typescript
const currentCategory = (cat || "B").toUpperCase();

if (currentCategory === "C") {
  title = lang === "ar" ? "فئة الشاحنات C" 
    : lang === "nl" ? "Categorie C - Vrachtwagens" 
    : "Catégorie C - Camions";
} else if (currentCategory === "A") {
  title = lang === "ar" ? "فئة الدراجات النارية A" 
    : lang === "nl" ? "Categorie A - Motorfietsen" 
    : "Catégorie A - Motos";
} else {
  title = lang === "ar" ? "فئة السيارات B" 
    : lang === "nl" ? "Categorie B - Auto's" 
    : "Catégorie B - Voitures";
}
```

## الاختبار

### إنشاء مستخدم اختبار:
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestUser(category) {
  const user = await prisma.user.create({
    data: {
      email: `test-category-${category.toLowerCase()}@gmail.com`,
      name: `Test User Category ${category}`,
      password: '123',
      category: category,
      paymentType: 'test',
      subscriptionType: 'theorie',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active',
      subscriptions: {
        create: {
          subscriptionType: 'theorie',
          category: category,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true
        }
      }
    }
  });
  
  console.log(`✅ Test user created for category ${category}`);
  console.log(`📧 Email: test-category-${category.toLowerCase()}@gmail.com`);
  console.log(`🔑 Password: 123`);
}

// إنشاء مستخدمين للاختبار
createTestUser('A');
createTestUser('B');
createTestUser('C');
```

### التحقق من البيانات:
```javascript
async function checkData() {
  const countA = await prisma.lessonA.count();
  const countB = await prisma.lessonB.count();
  const countC = await prisma.lessonC.count();
  
  console.log('📊 Lesson counts:');
  console.log('  Category A:', countA);
  console.log('  Category B:', countB);
  console.log('  Category C:', countC);
}
```

## الملاحظات المهمة

1. ✅ كل فئة لها جداول منفصلة للدروس والأسئلة
2. ✅ المستخدم يمكنه الاشتراك في فئات متعددة
3. ✅ كل اشتراك مستقل بتاريخ انتهاء خاص
4. ✅ الفئة تُحدد من URL parameter في صفحة الدروس
5. ✅ API يجلب البيانات من الجدول الصحيح حسب الفئة
6. ✅ العناوين تتغير حسب الفئة المختارة
7. ✅ النظام يدعم 3 لغات (NL, FR, AR)

## الملفات المحدثة

1. `components/CheckoutForm.tsx` - تحسين تحديد الفئة
2. `app/theorie/page.tsx` - إضافة سجلات التتبع
3. `app/api/subscribe/route.ts` - تحسين حفظ الاشتراك
4. `app/lessons/page.tsx` - تحسين جلب الدروس
5. `app/api/lessons/route.ts` - دعم الفئات المنفصلة
6. `app/api/questions/route.ts` - دعم الفئات المنفصلة
7. `app/api/login/route.ts` - استخدام الفئة من الاشتراك
8. `prisma/schema.prisma` - جداول منفصلة لكل فئة
