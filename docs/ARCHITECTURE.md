# 🏗️ بنية النظام - S & A Rijacademie

## نظرة عامة

هذا المستند يشرح البنية الكاملة للنظام وكيف تعمل جميع المكونات معاً.

---

## 📊 البنية العامة

```
┌─────────────────────────────────────────────────────────────┐
│                         المستخدم                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare CDN                            │
│  • Cache للصور والفيديوهات (90% من الطلبات)                │
│  • DDoS Protection                                           │
│  • SSL/TLS                                                   │
│  • Brotli Compression                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Vercel Edge Network                         │
│  • Auto-scaling                                              │
│  • Serverless Functions                                      │
│  • Global CDN                                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Frontend (React + TypeScript)                       │   │
│  │  • Pages (App Router)                                │   │
│  │  • Components                                        │   │
│  │  • Context (Language)                                │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Middleware                                          │   │
│  │  • Rate Limiting (100 req/min)                       │   │
│  │  • Security Headers                                  │   │
│  │  • Auth Check                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Routes                                          │   │
│  │  • /api/lessons                                      │   │
│  │  • /api/questions                                    │   │
│  │  • /api/exam                                         │   │
│  │  • /api/subscribe                                    │   │
│  │  • /api/admin/*                                      │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Prisma ORM                                │
│  • Connection Pooling (PgBouncer)                            │
│  • Query Optimization                                        │
│  • Type Safety                                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Neon PostgreSQL Database                        │
│  • Serverless PostgreSQL                                     │
│  • Auto-scaling                                              │
│  • Automatic Backups                                         │
│  • Europe Region (Frankfurt)                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 تدفق البيانات

### 1. طلب صفحة عادية (Static Content)

```
User → Cloudflare (Cache Hit) → User
     ↑ 90% من الطلبات تنتهي هنا
```

### 2. طلب API (Dynamic Content)

```
User → Cloudflare → Vercel → Middleware → API Route → Prisma → Database
                                                              ↓
User ← Cloudflare ← Vercel ← Middleware ← API Route ← Prisma ← Database
```

### 3. رفع ملف (Video/Audio)

```
User → Vercel → File Validation → Save to Public → Database (URL)
```

---

## 🗄️ قاعدة البيانات

### الجداول الرئيسية:

```
User (المستخدمين)
├── id
├── email (unique, indexed)
├── password (hashed)
├── status (indexed)
├── expiryDate (indexed)
├── subscriptions (relation)
└── examResults (relation)

Subscription (الاشتراكات)
├── id
├── userId (indexed)
├── subscriptionType (Theori/Praktijk/Examen)
├── category (A/B/C)
├── isActive (indexed)
└── expiryDate (indexed)

LessonA/B/C (الدروس)
├── id
├── title
├── questionType
├── questions (relation)
└── examQuestions (relation)

QuestionA/B/C (الأسئلة)
├── id
├── textNL/FR/AR
├── videoUrls (array)
├── audioUrl
├── explanationNL/FR/AR
├── lessonId (indexed)
└── lesson (relation)

ExamQuestionA/B/C (أسئلة الامتحان)
├── id
├── textNL
├── videoUrls
├── answer1/2/3
├── correctAnswer
├── lessonId
└── lesson (relation)

PraktijkLesson (دروس عملية)
├── id
├── title
├── type (training/hazard)
└── questions (relation)

PraktijkQuestion (أسئلة عملية)
├── id
├── textNL/FR/AR
├── videoUrls
├── audioUrl
├── explanationNL/FR/AR
├── lessonId (indexed)
└── lesson (relation)

ExamResult (نتائج الامتحانات)
├── id
├── userEmail
├── lessonTitle
├── score
├── passed
└── answers (JSON)
```

### Indexes للأداء:

```sql
-- User indexes
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_user_status ON User(status);
CREATE INDEX idx_user_expiry ON User(expiryDate);

-- Subscription indexes
CREATE INDEX idx_sub_user ON Subscription(userId);
CREATE INDEX idx_sub_active ON Subscription(isActive);
CREATE INDEX idx_sub_expiry ON Subscription(expiryDate);

-- Question indexes
CREATE INDEX idx_qa_lesson ON QuestionA(lessonId);
CREATE INDEX idx_qb_lesson ON QuestionB(lessonId);
CREATE INDEX idx_qc_lesson ON QuestionC(lessonId);
CREATE INDEX idx_pq_lesson ON PraktijkQuestion(lessonId);
```

---

## 🔐 الأمان

### 1. Middleware Security

```typescript
// Rate Limiting
100 requests/minute per IP

// Security Headers
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Referrer-Policy: strict-origin-when-cross-origin
```

### 2. File Upload Validation

```typescript
// lib/fileValidation.ts
Video: max 100MB, types: mp4/webm/ogg
Audio: max 10MB, types: mp3/wav/ogg
Image: max 5MB, types: jpg/png/gif/webp
```

### 3. Database Security

```typescript
// Prisma ORM
- SQL Injection Prevention (automatic)
- Type Safety
- Input Validation
```

### 4. Authentication

```typescript
// Session-based
- Secure cookies
- HttpOnly
- SameSite: Strict
```

---

## ⚡ تحسينات الأداء

### 1. Connection Pooling

```typescript
// Prisma + PgBouncer
DATABASE_URL=postgresql://...@host-pooler.neon.tech/...?pgbouncer=true

// Benefits:
- يعيد استخدام connections
- يتحمل آلاف الـ requests
- أسرع بـ 3-5 مرات
```

### 2. Cloudflare CDN

```
Cache Rules:
- *.mp4, *.webm → Cache Everything (1 month)
- *.jpg, *.png → Cache Everything (1 month)
- *.mp3, *.wav → Cache Everything (1 month)

Result:
- 90% من الطلبات من Cache
- تحميل فيديو: 0.5-1s
```

### 3. Database Indexes

```prisma
@@index([email])
@@index([status])
@@index([lessonId])

Result:
- Queries أسرع بـ 100x
- Login: <50ms
```

### 4. Next.js Optimization

```javascript
// next.config.js
- Image Optimization
- Gzip Compression
- Cache Headers
- Code Splitting
```

---

## 🌍 دعم اللغات

### البنية:

```
locales/
├── nl.json (هولندي)
├── fr.json (فرنسي)
├── ar.json (عربي)
└── admin.json (لوحة التحكم)

context/
└── LangContext.tsx (إدارة اللغة)
```

### الاستخدام:

```typescript
const { t, lang, setLang } = useLang();

// في المكونات
<h1>{t.welcome}</h1>

// تبديل اللغة
<button onClick={() => setLang('nl')}>NL</button>
```

---

## 📁 هيكل الملفات

```
Sewar/
├── app/                      # Next.js App Router
│   ├── admin/               # لوحة التحكم
│   │   ├── questions/       # إدارة الأسئلة
│   │   └── subscribers/     # إدارة المشتركين
│   ├── api/                 # API Routes
│   │   ├── lessons/         # دروس Theori
│   │   ├── questions/       # أسئلة Theori
│   │   ├── exam/            # امتحانات
│   │   ├── praktijk/        # دروس عملية
│   │   ├── subscribe/       # اشتراكات
│   │   └── admin/           # Admin APIs
│   ├── lessons/             # صفحات الدروس
│   ├── examen/              # صفحات الامتحانات
│   ├── praktical/           # صفحات عملية
│   └── page.tsx             # الصفحة الرئيسية
├── components/              # React Components
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── LoginModal.tsx
│   └── CheckoutForm.tsx
├── context/                 # React Context
│   └── LangContext.tsx
├── lib/                     # Utilities
│   ├── prisma.ts           # Prisma Client
│   └── fileValidation.ts   # File Upload
├── locales/                 # ملفات الترجمة
├── prisma/                  # Database
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/                  # Static Files
│   ├── hero.jpg
│   ├── logo.png
│   └── uploads/            # User uploads
├── docs/                    # Documentation
├── middleware.ts            # Next.js Middleware
├── vercel.json             # Vercel Config
└── .env                    # Environment Variables
```

---

## 🔄 دورة حياة Request

### مثال: عرض درس

```
1. User يضغط على "Lesson 1"
   ↓
2. Middleware يتحقق من:
   - Rate Limit (OK)
   - Security Headers (Added)
   ↓
3. Page Component يُحمّل
   ↓
4. useEffect يطلب API:
   GET /api/lessons?category=A&type=Theori
   ↓
5. API Route:
   - يتحقق من Auth (optional)
   - يستعلم من Database عبر Prisma
   ↓
6. Prisma:
   - يستخدم Connection Pool
   - يُنفذ Query مع Index
   ↓
7. Database يُرجع البيانات
   ↓
8. API يُرجع JSON
   ↓
9. Component يعرض البيانات
   ↓
10. User يشاهد الدرس
```

---

## 📊 مؤشرات الأداء

### السرعة:
- First Contentful Paint: <1s
- Time to Interactive: <2s
- API Response: <100ms
- Database Query: <50ms
- Video Load: 0.5-1s (مع Cloudflare)

### السعة:
- مستخدمين متزامنين: 1000+
- Requests/second: 100+
- Database connections: 100+ (pooled)

### الاستقرار:
- Uptime: 99.9%
- Error rate: <0.1%
- Cold start: <500ms

---

## 🚀 Deployment Pipeline

```
1. Developer → Git Push
   ↓
2. GitHub → Webhook to Vercel
   ↓
3. Vercel:
   - npm install
   - npx prisma generate
   - npm run build
   - Deploy to Edge Network
   ↓
4. Automatic:
   - SSL Certificate
   - DNS Configuration
   - CDN Distribution
   ↓
5. Live! 🎉
```

---

## 🔮 المستقبل

### تحسينات مخططة:
- [ ] Redis Cache للـ sessions
- [ ] WebSocket للـ real-time updates
- [ ] Progressive Web App (PWA)
- [ ] Offline support
- [ ] Push notifications
- [ ] Analytics Dashboard
- [ ] A/B Testing

---

## 📞 الدعم

للأسئلة حول البنية:
- راجع: `docs/CODE-STRUCTURE.md`
- راجع: `docs/DEPLOY-TO-INTERNET.md`
- راجع: `docs/SECURITY-AND-PERFORMANCE.md`

---

**آخر تحديث:** فبراير 2026
