# 🔧 أخطاء Vercel الشائعة وحلولها

## ❌ الأخطاء الشائعة

---

## 1. Invalid region selector

### الخطأ:
```
Error: Invalid region selector: "ams1"
```

### السبب:
- Vercel غيّر نظام المناطق (regions)
- `regions` لم يعد مدعوماً في `vercel.json`

### الحل:
احذف `regions` من `vercel.json`:

#### ❌ خطأ:
```json
{
  "regions": ["ams1", "cdg1"],
  "functions": {
    ...
  }
}
```

#### ✅ صحيح:
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10,
      "memory": 1024
    }
  }
}
```

**ملاحظة:** Vercel الآن يختار المنطقة الأفضل تلقائياً! ✅

---

## 2. Environment variable not found

### الخطأ:
```
Error: Environment variable not found: DATABASE_URL
```

### السبب:
- لم يتم إضافة Environment Variables في Vercel

### الحل:
1. اذهب إلى: Settings → Environment Variables
2. أضف المتغيرات المطلوبة:
   - `DATABASE_URL`
   - `DIRECT_DATABASE_URL`
   - `NEXT_PUBLIC_APP_URL`
3. تأكد من اختيار "Production" ✅
4. Redeploy المشروع

---

## 3. Prisma Client not generated

### الخطأ:
```
Error: @prisma/client did not initialize yet
```

### السبب:
- Prisma Client لم يتم إنشاؤه أثناء Build

### الحل:

#### الطريقة 1: تحديث Build Command
في Vercel Settings → General:
```bash
npx prisma generate && npm run build
```

#### الطريقة 2: إضافة postinstall script
في `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

---

## 4. Database connection failed

### الخطأ:
```
Error: Can't reach database server at host
```

### السبب:
- رابط قاعدة البيانات خاطئ
- أو Neon لا يسمح بالاتصال من Vercel

### الحل:

#### 1. تحقق من الرابط:
```env
# يجب أن يحتوي على:
?sslmode=require
```

#### 2. استخدم Pooled connection:
```env
DATABASE_URL=postgresql://...@host-pooler.neon.tech/...?pgbouncer=true
```

#### 3. في Neon Dashboard:
- Settings → IP Allow
- تأكد من السماح لجميع IPs (0.0.0.0/0)

---

## 5. Build timeout

### الخطأ:
```
Error: Build exceeded maximum duration of 45 seconds
```

### السبب:
- Build يأخذ وقت طويل جداً
- عادة بسبب dependencies كثيرة

### الحل:

#### 1. استخدم Vercel Pro (إذا لزم الأمر):
- Build timeout: 15 دقيقة بدلاً من 45 ثانية

#### 2. قلل Dependencies:
```bash
npm prune --production
```

#### 3. استخدم Cache:
Vercel يفعل هذا تلقائياً ✅

---

## 6. Module not found

### الخطأ:
```
Error: Cannot find module '@prisma/client'
```

### السبب:
- Dependencies لم يتم تثبيتها بشكل صحيح

### الحل:

#### 1. تحقق من package.json:
```json
{
  "dependencies": {
    "@prisma/client": "^6.19.2",
    "prisma": "^6.19.2"
  }
}
```

#### 2. في Terminal محلي:
```bash
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

---

## 7. API route returns 404

### الخطأ:
```
404 - This page could not be found
```

### السبب:
- API route في مكان خاطئ
- أو لم يتم export بشكل صحيح

### الحل:

#### 1. تأكد من المسار:
```
app/api/lessons/route.ts  ✅
app/api/lessons.ts         ❌
```

#### 2. تأكد من Export:
```typescript
// ✅ صحيح
export async function GET(request: Request) {
  ...
}

// ❌ خطأ
async function GET(request: Request) {
  ...
}
```

---

## 8. Images not loading

### الخطأ:
- الصور لا تظهر على الموقع

### السبب:
- المسار خاطئ
- أو الصور ليست في `public/`

### الحل:

#### 1. ضع الصور في public/:
```
public/
  ├── hero.jpg     ✅
  ├── logo.png     ✅
  └── images/
      └── test.jpg ✅
```

#### 2. استخدم المسار الصحيح:
```jsx
// ✅ صحيح
<img src="/hero.jpg" />

// ❌ خطأ
<img src="./hero.jpg" />
<img src="hero.jpg" />
```

---

## 9. Videos not loading

### الخطأ:
- الفيديوهات لا تُحمّل

### السبب:
- الفيديوهات كبيرة جداً
- أو middleware يمنعها

### الحل:

#### 1. تحقق من middleware.ts:
```typescript
// يجب أن يستثني الفيديوهات
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|webp|ico|mp4|webm|mp3|wav)$).*)',
  ],
}
```

#### 2. استخدم Cloudflare CDN:
- يخزن الفيديوهات في cache
- أسرع بكثير ⚡

---

## 10. Deployment stuck

### الخطأ:
- Deployment يبقى في "Building..." لفترة طويلة

### السبب:
- مشكلة في Build process
- أو Vercel down

### الحل:

#### 1. انتظر 5 دقائق
- أحياناً يكون بطيء فقط

#### 2. Cancel و Redeploy:
- Deployments → ... → Cancel
- ثم Redeploy

#### 3. تحقق من Vercel Status:
```
https://www.vercel-status.com
```

---

## 🔍 كيف تجد الأخطاء؟

### في Vercel Dashboard:

#### 1. Build Logs:
```
Deployments → [اختر deployment] → View Function Logs
```

#### 2. Runtime Logs:
```
Deployments → [اختر deployment] → View Function Logs
```

#### 3. Real-time Logs:
```
Project → Logs (في القائمة الجانبية)
```

---

## 📞 المساعدة

### إذا لم تجد الحل:

#### 1. Vercel Support:
```
https://vercel.com/support
```

#### 2. Vercel Docs:
```
https://vercel.com/docs
```

#### 3. Vercel Community:
```
https://github.com/vercel/vercel/discussions
```

---

## ✅ نصائح لتجنب الأخطاء

1. ✅ اختبر محلياً أولاً: `npm run build`
2. ✅ تحقق من Environment Variables
3. ✅ استخدم Pooled connection للـ database
4. ✅ تأكد من `vercel.json` صحيح
5. ✅ راجع logs عند حدوث خطأ
6. ✅ استخدم `.env.example` كمرجع

---

**ملاحظة:** معظم الأخطاء بسيطة وسهلة الحل! 🚀
