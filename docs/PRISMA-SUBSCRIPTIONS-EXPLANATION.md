# شرح نظام الاشتراكات المتعددة في Prisma

## البنية الحالية:

### 1. جدول User (المستخدمين):
```prisma
model User {
  id               Int              @id @default(autoincrement())
  email            String           @unique
  name             String
  password         String
  phone            String?
  category         String           // الفئة الرئيسية (للتوافق مع الكود القديم)
  subscriptionType String?          // نوع الاشتراك الرئيسي (للتوافق مع الكود القديم)
  expiryDate       DateTime         // تاريخ انتهاء الاشتراك الرئيسي
  subscriptions    Subscription[]   // علاقة مع الاشتراكات المتعددة
  createdAt        DateTime         @default(now())
}
```

### 2. جدول Subscription (الاشتراكات):
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

## كيف يعمل النظام:

### مثال عملي:

#### المستخدم في جدول User:
```json
{
  "id": 1,
  "email": "rami@example.com",
  "name": "Rami",
  "category": "B",
  "subscriptionType": "theorie",
  "expiryDate": "2026-03-01"
}
```

#### اشتراكات المستخدم في جدول Subscription:
```json
[
  {
    "id": 1,
    "userId": 1,
    "subscriptionType": "theorie",
    "category": "A",
    "expiryDate": "2026-03-01",
    "isActive": true,
    "createdAt": "2026-02-01"
  },
  {
    "id": 2,
    "userId": 1,
    "subscriptionType": "examen",
    "category": "B",
    "expiryDate": "2026-03-15",
    "isActive": true,
    "createdAt": "2026-02-10"
  },
  {
    "id": 3,
    "userId": 1,
    "subscriptionType": "praktijk-lessons",
    "category": "C",
    "expiryDate": "2026-04-01",
    "isActive": true,
    "createdAt": "2026-02-20"
  }
]
```

## كيف يتم عرض البيانات في لوحة التحكم:

### الكود في API (`app/api/admin/subscribers/route.ts`):

```typescript
// 1. جلب المستخدمين مع اشتراكاتهم
const users = await prisma.user.findMany({
  where: whereConditions,
  include: {
    subscriptions: {
      where: {
        isActive: true
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
});

// 2. تحويل البيانات لعرض كل اشتراك في صف منفصل
const subscriptionRows: any[] = [];
users.forEach((user: any) => {
  if (user.subscriptions && user.subscriptions.length > 0) {
    user.subscriptions.forEach((sub: any) => {
      subscriptionRows.push({
        id: `${user.id}-${sub.id}`,
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        subscriptionType: sub.subscriptionType,
        category: sub.category,
        expiryDate: sub.expiryDate,
        createdAt: sub.createdAt,
        isActive: sub.isActive
      });
    });
  }
});
```

### النتيجة في لوحة التحكم:

| الاسم | البريد | نوع الاشتراك | الفئة | تاريخ الانتهاء | تاريخ الاشتراك |
|-------|--------|--------------|-------|----------------|----------------|
| Rami  | rami@example.com | دروس نظرية | A | 2026-03-01 | 2026-02-01 |
| Rami  | rami@example.com | امتحانات | B | 2026-03-15 | 2026-02-10 |
| Rami  | rami@example.com | دروس عملية - فيديوهات | C | 2026-04-01 | 2026-02-20 |

## المميزات:

### 1. فصل كامل للاشتراكات:
- كل اشتراك له سجل منفصل في جدول Subscription
- كل اشتراك له تاريخ انتهاء خاص به
- كل اشتراك له تاريخ إنشاء خاص به

### 2. منع التكرار:
```prisma
@@unique([userId, subscriptionType, category])
```
هذا يمنع المستخدم من الاشتراك في نفس النوع والفئة مرتين.

### 3. الحذف التلقائي:
```prisma
onDelete: Cascade
```
عند حذف المستخدم، يتم حذف جميع اشتراكاته تلقائياً.

## كيفية إضافة اشتراك جديد:

### في API (`app/api/subscribe/route.ts`):

```typescript
// التحقق من عدم وجود اشتراك مكرر
const existingSubscription = await prisma.subscription.findFirst({
  where: {
    userId: user.id,
    subscriptionType: subscriptionType,
    category: category,
    isActive: true
  }
});

if (existingSubscription) {
  return NextResponse.json({
    success: false,
    message: "لديك اشتراك نشط بالفعل في هذه الفئة ونوع الاشتراك"
  });
}

// إنشاء اشتراك جديد
const newSubscription = await prisma.subscription.create({
  data: {
    userId: user.id,
    subscriptionType: subscriptionType,
    category: category,
    expiryDate: expiryDate,
    isActive: true
  }
});
```

## كيفية جلب اشتراكات مستخدم معين:

### مثال 1: جلب جميع الاشتراكات النشطة:
```typescript
const user = await prisma.user.findUnique({
  where: { email: "rami@example.com" },
  include: {
    subscriptions: {
      where: {
        isActive: true
      }
    }
  }
});

console.log(user.subscriptions);
// [
//   { subscriptionType: "theorie", category: "A", ... },
//   { subscriptionType: "examen", category: "B", ... },
//   { subscriptionType: "praktijk-lessons", category: "C", ... }
// ]
```

### مثال 2: جلب اشتراك معين:
```typescript
const subscription = await prisma.subscription.findFirst({
  where: {
    userId: 1,
    subscriptionType: "theorie",
    category: "A",
    isActive: true
  }
});
```

### مثال 3: جلب جميع الاشتراكات في فئة معينة:
```typescript
const subscriptions = await prisma.subscription.findMany({
  where: {
    userId: 1,
    category: "B",
    isActive: true
  },
  include: {
    user: true
  }
});
```

## الإحصائيات:

### حساب عدد المشتركين:
```typescript
const totalSubscribers = await prisma.user.count({
  where: {
    subscriptions: {
      some: {
        isActive: true
      }
    }
  }
});
```

### حساب عدد الاشتراكات:
```typescript
const totalSubscriptions = await prisma.subscription.count({
  where: {
    isActive: true
  }
});
```

### حساب الاشتراكات حسب الفئة:
```typescript
const categoryA = await prisma.subscription.count({
  where: {
    category: "A",
    isActive: true
  }
});

const categoryB = await prisma.subscription.count({
  where: {
    category: "B",
    isActive: true
  }
});

const categoryC = await prisma.subscription.count({
  where: {
    category: "C",
    isActive: true
  }
});
```

## الخلاصة:

النظام الحالي يفصل كل اشتراك في سجل منفصل في جدول Subscription، وعند عرض البيانات في لوحة التحكم، يتم تحويل كل اشتراك إلى صف منفصل في الجدول. هذا يعطي:

1. ✅ فصل كامل للاشتراكات
2. ✅ تواريخ منفصلة لكل اشتراك
3. ✅ سهولة البحث والفلترة
4. ✅ إحصائيات دقيقة
5. ✅ منع التكرار
6. ✅ سهولة الإدارة

كل مستخدم يمكن أن يكون لديه عدة اشتراكات، وكل اشتراك يُعرض في صف منفصل في لوحة التحكم!
