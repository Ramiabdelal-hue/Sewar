# كيفية استخدام نظام الاشتراكات المتعددة

## للمستخدم

### السيناريو 1: اشتراك واحد فقط
1. افتح الموقع
2. اضغط على "Login"
3. أدخل البريد الإلكتروني وكلمة المرور
4. سيتم توجيهك مباشرة إلى صفحة اشتراكك

### السيناريو 2: اشتراكات متعددة
1. افتح الموقع
2. اضغط على "Login"
3. أدخل البريد الإلكتروني وكلمة المرور
4. **ستظهر لك قائمة بجميع اشتراكاتك النشطة**
5. اختر الاشتراك الذي تريد الدخول إليه
6. سيتم توجيهك إلى الصفحة المناسبة

## مثال عملي

### مستخدم لديه 3 اشتراكات:
```
البريد: student@example.com
كلمة المرور: 123456

الاشتراكات:
1. دروس نظرية - فئة B (ينتهي في 2026-03-15)
2. امتحانات - فئة A (ينتهي في 2026-04-20)
3. دروس عملية - فيديوهات (ينتهي في 2026-05-10)
```

**عند تسجيل الدخول:**
سيرى المستخدم 3 بطاقات:

```
┌─────────────────────────────────────┐
│ دروس نظرية - فئة B                 │
│ ينتهي في: 15/03/2026               │
│                              [→]    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ امتحانات - فئة A                   │
│ ينتهي في: 20/04/2026               │
│                              [→]    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ دروس عملية - فيديوهات              │
│ ينتهي في: 10/05/2026               │
│                              [→]    │
└─────────────────────────────────────┘
```

## للمطور

### إضافة اشتراك جديد لمستخدم موجود

```javascript
// مثال: إضافة اشتراك امتحانات فئة C لمستخدم موجود

// 1. المستخدم يختار الاشتراك من الصفحة الرئيسية
// 2. يملأ نموذج الدفع (سيستخدم نفس البريد الإلكتروني)
// 3. النظام يتحقق من وجود المستخدم
// 4. يضيف اشتراك جديد في جدول Subscriptions

// الكود في app/api/subscribe/route.ts يتعامل مع هذا تلقائياً:
await prisma.subscription.upsert({
  where: {
    userId_subscriptionType_category: {
      userId: user.id,
      subscriptionType: "examen",
      category: "C"
    }
  },
  update: {
    expiryDate: newExpiryDate,
    isActive: true
  },
  create: {
    userId: user.id,
    subscriptionType: "examen",
    category: "C",
    examCategory: "examTestC",
    expiryDate: newExpiryDate
  }
});
```

### التحقق من اشتراك معين

```javascript
// في أي صفحة، يمكنك التحقق من اشتراك معين:

const checkSpecificSubscription = async (email, type, category) => {
  const response = await fetch("/api/check-subscription", {
    method: "POST",
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  
  if (data.success && data.user.subscriptions) {
    const subscription = data.user.subscriptions.find(
      sub => sub.type === type && sub.category === category
    );
    
    if (subscription) {
      console.log("الاشتراك موجود ونشط!");
      return true;
    }
  }
  
  return false;
};

// مثال: التحقق من اشتراك الامتحانات فئة B
const hasExamB = await checkSpecificSubscription(
  "student@example.com",
  "examen",
  "B"
);
```

### عرض جميع اشتراكات المستخدم في صفحة

```javascript
const [userSubscriptions, setUserSubscriptions] = useState([]);

useEffect(() => {
  const fetchSubscriptions = async () => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;
    
    const response = await fetch("/api/check-subscription", {
      method: "POST",
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (data.success && data.user.subscriptions) {
      setUserSubscriptions(data.user.subscriptions);
    }
  };
  
  fetchSubscriptions();
}, []);

// عرض الاشتراكات
return (
  <div>
    <h2>اشتراكاتي</h2>
    {userSubscriptions.map((sub, index) => (
      <div key={index}>
        <h3>{sub.type} - {sub.category}</h3>
        <p>ينتهي في: {new Date(sub.expiryDate).toLocaleDateString()}</p>
      </div>
    ))}
  </div>
);
```

## أنواع الاشتراكات المتاحة

| النوع | القيمة في DB | الوصف |
|------|-------------|-------|
| دروس نظرية | `theorie` | دروس نظرية لفئة معينة (A, B, C) |
| امتحانات | `examen` | امتحانات لفئة معينة (A, B, C) |
| دروس عملية - فيديوهات | `praktijk-lessons` | فيديوهات تدريبية |
| دروس عملية - إدراك المخاطر | `praktijk-exam` | اختبارات إدراك المخاطر |

## الفئات المتاحة

- **A**: دراجات نارية (Motorcycles)
- **B**: سيارات (Cars)
- **C**: شاحنات (Trucks)

## ملاحظات مهمة

1. **لا يمكن الاشتراك في نفس النوع والفئة مرتين**: النظام يمنع التكرار تلقائياً
2. **تجديد الاشتراك**: عند تجديد اشتراك موجود، يتم تحديث تاريخ الانتهاء فقط
3. **الاشتراكات المنتهية**: لا تظهر في قائمة الاختيار عند تسجيل الدخول
4. **التوافق**: الكود القديم يعمل بشكل طبيعي مع النظام الجديد

## اختبار النظام

### اختبار 1: مستخدم جديد
1. اشترك في دروس نظرية فئة B
2. سجل الدخول → سيتم توجيهك مباشرة إلى الدروس

### اختبار 2: إضافة اشتراك ثاني
1. استخدم نفس البريد الإلكتروني
2. اشترك في امتحانات فئة A
3. سجل الدخول → ستظهر قائمة اختيار بالاشتراكين

### اختبار 3: تجديد اشتراك
1. استخدم نفس البريد الإلكتروني
2. اشترك في نفس النوع والفئة
3. سيتم تحديث تاريخ الانتهاء فقط

## الدعم الفني

إذا واجهت أي مشكلة:
1. تحقق من console.log في المتصفح
2. تحقق من logs الخادم
3. تحقق من قاعدة البيانات مباشرة:
   ```sql
   SELECT * FROM "Subscription" WHERE "userId" = [user_id];
   ```
