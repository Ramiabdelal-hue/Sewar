# 🚀 دليل الربط مع Vercel - خطوة بخطوة

## المتطلبات الأساسية

قبل البدء، تأكد من:
- ✅ تم رفع المشروع على GitHub
- ✅ قاعدة البيانات Neon جاهزة
- ✅ لديك Pooled و Direct connection strings

---

## 📋 الخطوات بالتفصيل

### 1️⃣ إنشاء حساب Vercel

#### أ) اذهب إلى Vercel
```
https://vercel.com
```

#### ب) اضغط "Sign Up"
- اختر "Continue with GitHub"
- سجل دخول بحساب GitHub الخاص بك
- وافق على الصلاحيات

✅ الآن لديك حساب Vercel مربوط بـ GitHub!

---

### 2️⃣ استيراد المشروع من GitHub

#### أ) في لوحة Vercel الرئيسية
- اضغط "Add New..."
- اختر "Project"

#### ب) اختر Repository
- ستظهر قائمة بجميع repositories الخاصة بك
- ابحث عن: `sa-rijacademie` (أو الاسم الذي اخترته)
- اضغط "Import"

#### ج) إعدادات المشروع
```
Framework Preset: Next.js (سيتم اكتشافه تلقائياً)
Root Directory: ./
Build Command: npm run build (تلقائي)
Output Directory: .next (تلقائي)
Install Command: npm install (تلقائي)
```

**لا تغيّر شيء!** الإعدادات الافتراضية صحيحة ✅

---

### 3️⃣ إضافة Environment Variables (مهم جداً!)

#### أ) في صفحة Import Project
- اضغط على "Environment Variables"
- أو scroll للأسفل حتى تجد القسم

#### ب) أضف المتغيرات التالية:

##### 1. DATABASE_URL (Pooled)
```
Key: DATABASE_URL
Value: postgresql://neondb_owner:npg_vAg8x1UOVTMW@ep-ancient-sound-agy6fvto-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```
**ملاحظة:** استخدم الرابط الـ Pooled (الذي فيه `-pooler`)

##### 2. DIRECT_DATABASE_URL (Direct)
```
Key: DIRECT_DATABASE_URL
Value: postgresql://neondb_owner:npg_vAg8x1UOVTMW@ep-ancient-sound-agy6fvto.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```
**ملاحظة:** استخدم الرابط الـ Direct (بدون `-pooler`)

##### 3. NEXT_PUBLIC_APP_URL
```
Key: NEXT_PUBLIC_APP_URL
Value: https://your-project.vercel.app
```
**ملاحظة:** سنحدثه بعد Deploy

##### 4. MOLLIE_API_KEY (اختياري)
```
Key: MOLLIE_API_KEY
Value: test_dHar4XY7LxsDOtmnkVtjNVWXLSlXsM
```
**ملاحظة:** للاختبار فقط. غيّره للإنتاج.

#### ج) اختر Environment
- Production: ✅ (مهم!)
- Preview: ✅ (اختياري)
- Development: ⬜ (غير مطلوب)

---

### 4️⃣ Deploy المشروع

#### أ) اضغط "Deploy"
- Vercel سيبدأ في:
  1. Clone المشروع من GitHub
  2. تثبيت Dependencies (npm install)
  3. تشغيل Prisma Generate
  4. Build المشروع (npm run build)
  5. Deploy على Edge Network

#### ب) انتظر (2-5 دقائق)
- شاهد الـ logs في الوقت الفعلي
- إذا ظهرت أخطاء، راجع القسم "حل المشاكل" أدناه

#### ج) Deploy ناجح! 🎉
- ستظهر رسالة: "Congratulations!"
- ستحصل على رابط مثل: `https://sa-rijacademie.vercel.app`

---

### 5️⃣ تحديث NEXT_PUBLIC_APP_URL

#### أ) انسخ رابط الموقع
```
https://sa-rijacademie-xxxxx.vercel.app
```

#### ب) حدّث Environment Variable
1. في Vercel Dashboard
2. اذهب إلى: Settings → Environment Variables
3. ابحث عن: `NEXT_PUBLIC_APP_URL`
4. اضغط "Edit"
5. غيّر القيمة إلى الرابط الحقيقي
6. اضغط "Save"

#### ج) Redeploy
1. اذهب إلى: Deployments
2. اضغط على آخر deployment
3. اضغط "..." (ثلاث نقاط)
4. اختر "Redeploy"

---

### 6️⃣ اختبار الموقع

#### أ) افتح الموقع
```
https://sa-rijacademie-xxxxx.vercel.app
```

#### ب) اختبر:
- ✅ الصفحة الرئيسية تعمل
- ✅ تبديل اللغات يعمل
- ✅ تسجيل الدخول (admin: rami / 123)
- ✅ لوحة التحكم تعمل
- ✅ الدروس تظهر
- ✅ الأسئلة تظهر

---

## 🔧 الإعدادات المتقدمة (اختياري)

### تفعيل Auto-Deploy

#### في GitHub:
- كل push جديد = deploy تلقائي ✅
- كل pull request = preview deployment ✅

#### في Vercel:
- Settings → Git
- تأكد من تفعيل:
  - ✅ Production Branch: main
  - ✅ Auto-deploy: Enabled

---

### إضافة Domain خاص (اختياري)

#### 1. في Vercel Dashboard
- اذهب إلى: Settings → Domains
- اضغط "Add"
- أدخل domain: `sa-rijacademie.com`

#### 2. في مزود Domain (GoDaddy, Namecheap)
- أضف DNS records حسب تعليمات Vercel

#### 3. انتظر (5-30 دقيقة)
- SSL سيتم تفعيله تلقائياً ✅

---

## 🆘 حل المشاكل الشائعة

### المشكلة 1: Build Failed

#### الأعراض:
```
Error: Build failed
```

#### الحل:
1. تحقق من logs في Vercel
2. تأكد من Environment Variables صحيحة
3. تأكد من `DATABASE_URL` و `DIRECT_DATABASE_URL` موجودين
4. جرّب Redeploy

---

### المشكلة 2: Database Connection Failed

#### الأعراض:
```
Error: Can't reach database server
```

#### الحل:
1. تحقق من `DATABASE_URL` صحيح
2. تأكد من `?sslmode=require` في نهاية الرابط
3. تأكد من استخدام Pooled connection (فيه `-pooler`)
4. في Neon Dashboard:
   - Settings → IP Allow
   - تأكد من السماح لـ Vercel IPs

---

### المشكلة 3: Environment Variables Not Working

#### الأعراض:
```
Error: Environment variable not found
```

#### الحل:
1. اذهب إلى: Settings → Environment Variables
2. تأكد من اختيار "Production" ✅
3. اضغط "Save"
4. Redeploy المشروع

---

### المشكلة 4: Prisma Generate Failed

#### الأعراض:
```
Error: Prisma Client not generated
```

#### الحل:
1. تأكد من `DIRECT_DATABASE_URL` موجود
2. في Vercel Settings → General
3. Build Command: `npx prisma generate && npm run build`
4. Redeploy

---

### المشكلة 5: Images/Videos Not Loading

#### الأعراض:
- الصور لا تظهر
- الفيديوهات لا تُحمّل

#### الحل:
1. تأكد من الملفات في `public/`
2. استخدم `/image.jpg` وليس `./image.jpg`
3. تحقق من middleware (يجب أن يسمح بالملفات الثابتة)

---

## 📊 مراقبة الأداء

### Vercel Analytics (مجاني)

#### تفعيل:
1. في Vercel Dashboard
2. اذهب إلى: Analytics
3. اضغط "Enable"

#### ما ستراه:
- 📊 عدد الزوار
- ⚡ سرعة الموقع
- 🌍 المواقع الجغرافية
- 📱 الأجهزة المستخدمة
- ❌ الأخطاء

---

## 🔄 التحديثات المستقبلية

### كيف تحدّث الموقع؟

#### 1. عدّل الكود محلياً
```bash
# في مجلد المشروع
git add .
git commit -m "Update: description of changes"
git push origin main
```

#### 2. Vercel سيقوم بـ:
- ✅ اكتشاف التغييرات تلقائياً
- ✅ Build جديد
- ✅ Deploy تلقائي
- ✅ إشعار بالنجاح/الفشل

#### 3. تحقق من الموقع
- الموقع سيتحدث تلقائياً في 2-3 دقائق

---

## ✅ قائمة التحقق النهائية

- [ ] تم إنشاء حساب Vercel
- [ ] تم ربط Vercel بـ GitHub
- [ ] تم استيراد المشروع
- [ ] تم إضافة Environment Variables:
  - [ ] DATABASE_URL (pooled)
  - [ ] DIRECT_DATABASE_URL (direct)
  - [ ] NEXT_PUBLIC_APP_URL
  - [ ] MOLLIE_API_KEY (اختياري)
- [ ] تم Deploy بنجاح
- [ ] تم تحديث NEXT_PUBLIC_APP_URL
- [ ] تم اختبار الموقع
- [ ] جميع الميزات تعمل

---

## 🎉 مبروك!

موقعك الآن على الإنترنت! 🚀

```
https://sa-rijacademie-xxxxx.vercel.app
```

### الخطوات التالية:
1. ✅ اختبر جميع الميزات
2. ✅ غيّر كلمة مرور Admin
3. ✅ أضف محتوى (دروس، أسئلة)
4. ✅ فعّل Cloudflare CDN (اختياري)
5. ✅ أضف Domain خاص (اختياري)

---

## 📞 المساعدة

### الأدلة الأخرى:
- [`docs/QUICK-DEPLOY-GUIDE.md`](docs/QUICK-DEPLOY-GUIDE.md)
- [`docs/DEPLOY-TO-INTERNET.md`](docs/DEPLOY-TO-INTERNET.md)
- [`docs/DEPLOYMENT-CHECKLIST.md`](docs/DEPLOYMENT-CHECKLIST.md)

### Vercel Support:
- https://vercel.com/support
- https://vercel.com/docs

---

**ملاحظة:** العملية بسيطة جداً! معظم الإعدادات تلقائية. 🚀
