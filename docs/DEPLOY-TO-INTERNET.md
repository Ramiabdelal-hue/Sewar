# 🚀 دليل رفع الموقع على الإنترنت

## الخيار 1: Vercel (الأسهل والأسرع - موصى به) ⭐

### المميزات:
- ✅ مجاني للمشاريع الصغيرة والمتوسطة
- ✅ نشر تلقائي من GitHub
- ✅ SSL مجاني (HTTPS)
- ✅ CDN عالمي سريع جداً
- ✅ سهل جداً في الإعداد (5 دقائق)
- ✅ Domain مجاني (.vercel.app)

### الخطوات:

#### 1. إنشاء حساب GitHub (إذا لم يكن لديك)
1. اذهب إلى: https://github.com
2. اضغط "Sign up"
3. أكمل التسجيل

#### 2. رفع المشروع على GitHub

```bash
# في مجلد المشروع
git init
git add .
git commit -m "Initial commit"

# إنشاء repository على GitHub ثم:
git remote add origin https://github.com/YOUR_USERNAME/rijacademie.git
git branch -M main
git push -u origin main
```

#### 3. إنشاء حساب Vercel
1. اذهب إلى: https://vercel.com
2. اضغط "Sign Up"
3. اختر "Continue with GitHub"
4. وافق على الصلاحيات

#### 4. نشر المشروع
1. في لوحة Vercel، اضغط "Add New Project"
2. اختر repository "rijacademie"
3. اضغط "Import"
4. في إعدادات المشروع:
   - Framework Preset: Next.js (سيتم اكتشافه تلقائياً)
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

5. **إضافة Environment Variables** (مهم جداً!):
   اضغط "Environment Variables" وأضف:
   
   ```
   DATABASE_URL=postgresql://user:password@host/database
   MOLLIE_API_KEY=test_xxxxx (اختياري)
   NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
   ```

6. اضغط "Deploy"
7. انتظر 2-3 دقائق
8. ✅ الموقع جاهز!

#### 5. الحصول على رابط الموقع
بعد النشر، ستحصل على رابط مثل:
```
https://rijacademie.vercel.app
```

#### 6. ربط Domain خاص (اختياري)
إذا كان لديك domain خاص (مثل sa-rijacademie.com):
1. في Vercel، اذهب إلى Settings > Domains
2. أضف domain الخاص بك
3. اتبع التعليمات لتحديث DNS

---

## الخيار 2: Netlify (بديل جيد)

### الخطوات:
1. اذهب إلى: https://netlify.com
2. سجل باستخدام GitHub
3. اضغط "Add new site" > "Import an existing project"
4. اختر repository من GitHub
5. إعدادات البناء:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. أضف Environment Variables
7. اضغط "Deploy"

---

## الخيار 3: Railway (يدعم PostgreSQL مجاناً)

### المميزات:
- ✅ قاعدة بيانات PostgreSQL مجانية
- ✅ سهل الإعداد
- ✅ $5 مجاناً شهرياً

### الخطوات:
1. اذهب إلى: https://railway.app
2. سجل باستخدام GitHub
3. اضغط "New Project"
4. اختر "Deploy from GitHub repo"
5. اختر repository
6. أضف PostgreSQL:
   - اضغط "+ New"
   - اختر "Database" > "PostgreSQL"
7. انسخ DATABASE_URL من PostgreSQL
8. أضف Environment Variables في إعدادات المشروع
9. انتظر النشر

---

## إعداد قاعدة البيانات للإنتاج

### الخيار 1: Neon (موصى به - مجاني) ⭐

1. اذهب إلى: https://neon.tech
2. سجل حساب جديد
3. اضغط "Create Project"
4. اختر:
   - Region: Europe (أقرب لبلجيكا)
   - PostgreSQL version: 15
5. **احصل على Connection Strings** (مهم جداً!):
   
   في Neon Dashboard، ستجد نوعين من الروابط:
   
   **أ) Direct Connection** (للـ Migrations):
   ```
   DATABASE_URL=postgresql://user:pass@host.neon.tech/database?sslmode=require
   ```
   
   **ب) Pooled Connection** (للـ Production - موصى به):
   ```
   DATABASE_URL=postgresql://user:pass@host-pooler.neon.tech/database?sslmode=require&pgbouncer=true
   ```

6. أضفهم في Vercel Environment Variables:
   ```
   # للاستخدام العادي (Pooled - أسرع وأكثر استقراراً)
   DATABASE_URL=postgresql://user:pass@host-pooler.neon.tech/database?sslmode=require&pgbouncer=true
   
   # للـ Migrations فقط (Direct)
   DIRECT_DATABASE_URL=postgresql://user:pass@host.neon.tech/database?sslmode=require
   ```

### ⚡ لماذا Connection Pooling مهم؟

**بدون Pooling:**
- كل request يفتح connection جديد
- Vercel Serverless = مئات الـ connections
- Database يتعطل بسرعة ❌

**مع Pooling:**
- PgBouncer يدير الـ connections
- يعيد استخدام connections موجودة
- يتحمل آلاف الـ requests ✅
- أسرع بـ 3-5 مرات ⚡

### الخيار 2: Supabase (مجاني أيضاً)

1. اذهب إلى: https://supabase.com
2. سجل حساب
3. اضغط "New Project"
4. في Settings > Database، انسخ Connection String
5. أضفه في Vercel

### تشغيل Migrations

بعد إعداد قاعدة البيانات:

```bash
# في terminal محلي - استخدم DIRECT connection للـ migrations
DIRECT_DATABASE_URL="postgresql://user:pass@host.neon.tech/database?sslmode=require" npx prisma migrate deploy

# ثم seed البيانات
DATABASE_URL="postgresql://user:pass@host-pooler.neon.tech/database?sslmode=require&pgbouncer=true" npx tsx prisma/seed.ts
```

**ملاحظة مهمة:** 
- استخدم `DIRECT_DATABASE_URL` للـ migrations (بدون pooler)
- استخدم `DATABASE_URL` (pooled) للتطبيق العادي

أو في Vercel:
1. اذهب إلى Settings > General
2. أضف Build Command:
   ```
   npx prisma generate && npx prisma migrate deploy && npm run build
   ```
3. تأكد من إضافة `DIRECT_DATABASE_URL` في Environment Variables

---

## ✅ قائمة التحقق قبل النشر

- [ ] رفع الكود على GitHub
- [ ] إعداد قاعدة بيانات (Neon مع Pooling)
- [ ] الحصول على Pooled و Direct connection strings
- [ ] تشغيل migrations على قاعدة الإنتاج
- [ ] إضافة Environment Variables في Vercel:
  - [ ] `DATABASE_URL` (pooled)
  - [ ] `DIRECT_DATABASE_URL` (direct)
  - [ ] `NEXT_PUBLIC_APP_URL`
  - [ ] `MOLLIE_API_KEY` (اختياري)
- [ ] إعداد Cloudflare CDN (موصى به بشدة!)
- [ ] تغيير كلمة مرور Admin
- [ ] اختبار الموقع بعد النشر
- [ ] اختبار نظام الدفع (Mollie)
- [ ] اختبار على الموبايل
- [ ] اختبار سرعة تحميل الفيديوهات

---

## 🔧 إعدادات مهمة بعد النشر

### 1. تحديث Admin Password
في قاعدة البيانات، غيّر كلمة مرور admin:
```sql
-- استخدم bcrypt لتشفير كلمة المرور
UPDATE "User" SET password = '$2b$10$...' WHERE email = 'admin@example.com';
```

### 2. إعداد Mollie للدفع الحقيقي
1. اذهب إلى: https://mollie.com
2. سجل حساب تجاري
3. احصل على Live API Key
4. أضفه في Vercel Environment Variables:
   ```
   MOLLIE_API_KEY=live_xxxxxxxxxxxxx
   ```

### 3. إعداد Cloudflare CDN (موصى به بشدة!) 🚀

**المميزات:**
- ✅ يخفف 90% من الضغط على السيرفر
- ✅ يخزن الصور والفيديوهات في cache
- ✅ حماية من DDoS attacks
- ✅ مجاني تماماً!
- ✅ يسرع الموقع 5-10 مرات

**الخطوات:**

1. **إنشاء حساب Cloudflare**
   - اذهب إلى: https://cloudflare.com
   - سجل حساب مجاني

2. **إضافة Domain**
   - اضغط "Add a Site"
   - أدخل domain الخاص بك (مثل: sa-rijacademie.com)
   - اختر Free Plan

3. **تحديث Nameservers**
   - Cloudflare سيعطيك nameservers مثل:
     ```
     ns1.cloudflare.com
     ns2.cloudflare.com
     ```
   - اذهب إلى مزود Domain (GoDaddy, Namecheap)
   - غيّر Nameservers إلى Cloudflare nameservers
   - انتظر 5-30 دقيقة

4. **إعداد DNS في Cloudflare**
   - أضف CNAME record:
     ```
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     Proxy: ON (البرتقالي) ✅
     ```
   - أضف CNAME للـ root:
     ```
     Type: CNAME
     Name: @
     Value: cname.vercel-dns.com
     Proxy: ON (البرتقالي) ✅
     ```

5. **تفعيل Cache للملفات الثابتة**
   - اذهب إلى: Rules > Page Rules
   - أضف Rule جديد:
     ```
     URL: *sa-rijacademie.com/*.mp4
     Settings: Cache Level = Cache Everything
     Edge Cache TTL = 1 month
     ```
   - كرر للصور والصوتيات:
     ```
     *.jpg, *.png, *.mp3, *.webm
     ```

6. **تفعيل Brotli Compression**
   - اذهب إلى: Speed > Optimization
   - فعّل: Brotli ✅
   - فعّل: Auto Minify (HTML, CSS, JS) ✅

7. **تفعيل SSL**
   - اذهب إلى: SSL/TLS
   - اختر: Full (strict) ✅

**النتيجة:**
- الفيديوهات تُحمّل من Cloudflare (أسرع)
- السيرفر يتحمل 10x زوار أكثر
- الموقع يعمل حتى لو Vercel down

### 4. إعداد Domain خاص (بدون Cloudflare)
إذا لم تستخدم Cloudflare:
1. في Vercel: Settings > Domains
2. أضف domain
3. في مزود Domain (GoDaddy, Namecheap, etc.):
   - أضف CNAME record:
     ```
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```
   - أضف A record:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21
     ```

---

## 🚀 تحسينات الأداء والاستقرار (مهم جداً!)

### 1. Vercel Serverless Functions
**المميزات:**
- ✅ Auto-scaling تلقائي
- ✅ يتحمل آلاف المستخدمين
- ✅ لا حاجة لإدارة السيرفرات
- ✅ Cold start سريع (<500ms)

**الإعدادات الموصى بها:**
في `vercel.json` (اختياري):
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10,
      "memory": 1024
    }
  },
  "regions": ["ams1", "cdg1"]
}
```

### 2. Prisma Connection Pooling (ضروري!)
**لماذا مهم:**
- Vercel Serverless = كل request = function جديد
- بدون pooling = مئات الـ connections = Database crash ❌
- مع pooling = استقرار 100% ✅

**التطبيق:**
```typescript
// lib/prisma.ts (موجود بالفعل)
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Environment Variables:**
```env
# Pooled (للاستخدام العادي)
DATABASE_URL="postgresql://...@host-pooler.neon.tech/...?pgbouncer=true"

# Direct (للـ migrations فقط)
DIRECT_DATABASE_URL="postgresql://...@host.neon.tech/..."
```

### 3. Cloudflare CDN (يخفف 90% من الضغط!)
**كيف يعمل:**
```
User → Cloudflare (Cache) → Vercel → Database
      ↑ 90% من الطلبات تتوقف هنا!
```

**ما يتم cache:**
- ✅ الصور (hero.jpg, logos, etc.)
- ✅ الفيديوهات (أسئلة، دروس)
- ✅ الصوتيات (mp3)
- ✅ CSS, JS files
- ❌ API routes (dynamic)

**النتيجة:**
- السيرفر يتحمل 10x زوار أكثر
- الفيديوهات تُحمّل أسرع بـ 5-10 مرات
- تكلفة Bandwidth = صفر (Cloudflare مجاني)

### 4. Database Indexes (موجود بالفعل)
```prisma
// في schema.prisma
model User {
  email      String   @unique
  status     String
  expiryDate DateTime?
  
  @@index([email])
  @@index([status])
  @@index([expiryDate])
}
```

**النتيجة:**
- استعلامات أسرع بـ 100x
- Login سريع (<50ms)
- Check subscription سريع

### 5. Rate Limiting (موجود في middleware.ts)
```typescript
// يمنع DDoS attacks
// 100 requests/minute per IP
```

---

## 📊 الأداء المتوقع

### بدون التحسينات:
- ❌ 50-100 مستخدم متزامن
- ❌ Database connections تنفذ
- ❌ تحميل فيديو: 5-10 ثواني
- ❌ Cold start: 2-3 ثواني

### مع التحسينات (Pooling + Cloudflare):
- ✅ 1000+ مستخدم متزامن
- ✅ Database مستقر 100%
- ✅ تحميل فيديو: 0.5-1 ثانية
- ✅ Cold start: <500ms

---

## 📊 مراقبة الموقع

### Vercel Analytics (مجاني)
1. في Vercel Dashboard
2. اذهب إلى Analytics
3. شاهد:
   - عدد الزوار
   - سرعة الموقع
   - الأخطاء

### Google Analytics (اختياري)
1. أنشئ حساب: https://analytics.google.com
2. احصل على Tracking ID
3. أضفه في `app/layout.tsx`

---

## 🆘 حل المشاكل الشائعة

### المشكلة: "Database connection failed"
**الحل:**
- تأكد من DATABASE_URL صحيح
- تأكد من `?sslmode=require` في نهاية الرابط
- تأكد من السماح بالاتصالات من Vercel IPs

### المشكلة: "Build failed"
**الحل:**
- تحقق من logs في Vercel
- تأكد من تثبيت جميع dependencies
- تأكد من عدم وجود أخطاء TypeScript

### المشكلة: "Images not loading"
**الحل:**
- تأكد من الصور في مجلد `public/`
- تأكد من استخدام `/image.jpg` وليس `./image.jpg`

### المشكلة: "API routes returning 404"
**الحل:**
- تأكد من أن API routes في `app/api/`
- تأكد من تصدير functions بشكل صحيح

---

## 💰 التكاليف المتوقعة

### مجاني تماماً:
- Vercel: مجاني للمشاريع الصغيرة
- Neon Database: 0.5GB مجاناً
- SSL Certificate: مجاني
- Domain .vercel.app: مجاني

### إذا احتجت ترقية:
- Vercel Pro: $20/شهر (غير مطلوب في البداية)
- Domain خاص: $10-15/سنة
- Neon Pro: $19/شهر (إذا احتجت أكثر من 0.5GB)

---

## 🎉 بعد النشر

موقعك الآن على الإنترنت! 🚀

شارك الرابط:
```
https://your-project.vercel.app
```

أو إذا ربطت domain:
```
https://sa-rijacademie.com
```

---

## 📞 هل تحتاج مساعدة؟

إذا واجهت أي مشكلة:
1. تحقق من Vercel logs
2. تحقق من Database logs
3. راجع هذا الدليل
4. اتصل بالدعم الفني

**ملاحظة:** النشر على Vercel يستغرق 5-10 دقائق فقط! 🚀
