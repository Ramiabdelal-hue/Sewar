# 📤 دليل رفع المشروع على GitHub

## ✅ التحقق قبل الرفع

### 1. تأكد من أن `.gitignore` موجود
```bash
# تحقق من وجود الملف
ls -la .gitignore
```

### 2. تأكد من أن `.env` لن يتم رفعه
```bash
# هذا الأمر يجب أن يُظهر .env في القائمة
git check-ignore .env
```

إذا أظهر `.env` → ممتاز! ✅  
إذا لم يظهر شيء → خطر! ❌

---

## 📤 خطوات الرفع

### الطريقة 1: من Terminal

#### 1. تهيئة Git
```bash
git init
```

#### 2. إضافة جميع الملفات
```bash
git add .
```

#### 3. التحقق من الملفات التي ستُرفع
```bash
git status
```

**تأكد من أن `.env` غير موجود في القائمة!**

#### 4. Commit
```bash
git commit -m "Initial commit - S & A Rijacademie"
```

#### 5. إنشاء Repository على GitHub
1. اذهب إلى: https://github.com
2. اضغط "New repository"
3. اسم Repository: `sa-rijacademie` (أو أي اسم تريده)
4. اختر: Private (خاص) أو Public (عام)
5. لا تضف README أو .gitignore (موجودين بالفعل)
6. اضغط "Create repository"

#### 6. ربط Repository المحلي بـ GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/sa-rijacademie.git
git branch -M main
```

#### 7. رفع الملفات
```bash
git push -u origin main
```

---

### الطريقة 2: من GitHub Desktop (أسهل)

#### 1. تحميل GitHub Desktop
- https://desktop.github.com

#### 2. تسجيل الدخول
- افتح GitHub Desktop
- سجل دخول بحساب GitHub

#### 3. إضافة المشروع
- File → Add Local Repository
- اختر مجلد المشروع: `C:\Users\R_abe\Sewar`

#### 4. Commit
- اكتب رسالة: "Initial commit - S & A Rijacademie"
- اضغط "Commit to main"

#### 5. Publish
- اضغط "Publish repository"
- اختر اسم: `sa-rijacademie`
- اختر: Private أو Public
- اضغط "Publish repository"

✅ تم! المشروع الآن على GitHub

---

## 🔍 التحقق من الرفع

### 1. افتح Repository على GitHub
```
https://github.com/YOUR_USERNAME/sa-rijacademie
```

### 2. تأكد من وجود الملفات:
- ✅ app/
- ✅ components/
- ✅ docs/
- ✅ prisma/
- ✅ public/
- ✅ package.json
- ✅ README.md
- ✅ .env.example

### 3. تأكد من عدم وجود:
- ❌ .env (يجب أن لا يكون موجود!)
- ❌ node_modules/
- ❌ .next/
- ❌ dev.db

---

## ⚠️ إذا رفعت `.env` بالخطأ

### احذفه فوراً:

```bash
# 1. احذف الملف من Git
git rm --cached .env

# 2. Commit
git commit -m "Remove .env file"

# 3. Push
git push origin main

# 4. غيّر كلمات المرور فوراً!
# - غيّر كلمة مرور قاعدة البيانات في Neon
# - غيّر Mollie API Key
# - حدّث .env المحلي بالقيم الجديدة
```

---

## 📊 حجم المشروع

### قبل الرفع:
- المجلد الكامل: ~500MB (مع node_modules)

### بعد الرفع على GitHub:
- Repository: ~5-10MB فقط
- node_modules لن يُرفع (سيتم تثبيته تلقائياً في Vercel)

---

## ✅ قائمة التحقق

- [ ] `.gitignore` موجود
- [ ] `.env` غير موجود في `git status`
- [ ] `.env.example` موجود (بدون بيانات حقيقية)
- [ ] تم إنشاء repository على GitHub
- [ ] تم رفع الملفات بنجاح
- [ ] تم التحقق من عدم وجود `.env` على GitHub
- [ ] جاهز للنشر على Vercel!

---

## 🚀 الخطوة التالية

بعد رفع المشروع على GitHub:
1. اذهب إلى Vercel: https://vercel.com
2. Import Project من GitHub
3. أضف Environment Variables
4. Deploy!

راجع: [`docs/QUICK-DEPLOY-GUIDE.md`](docs/QUICK-DEPLOY-GUIDE.md)

---

**ملاحظة:** لا تقلق! `.gitignore` يحميك تلقائياً من رفع الملفات الحساسة. 🔒
