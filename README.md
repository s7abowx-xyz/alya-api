# ALYA API

منصة API آمنة مبنية بـ **TypeScript** فوق **Node.js**، باستخدام **Express.js** و**Prisma** (PostgreSQL). الواجهات الأمامية (تسجيل الدخول، إنشاء حساب، لوحة التحكم) مبنية بـ **HTML عادي + Tailwind CSS + JavaScript عادي** بدون أي فريمورك واجهات.

## المزايا

- تسجيل حساب / تسجيل دخول / تسجيل خروج
- مصادقة عبر **JWT** (access token + refresh token عبر HTTP-only cookies)
- كل مستخدم يحصل تلقائيًا على **مفتاح API** خاص به
- تحديد معدل الطلبات (rate limiting) على مسارات المصادقة
- تحقق من صحة المدخلات باستخدام **Zod**
- تشفير كلمات المرور باستخدام **bcrypt**
- واجهات RTL بالعربية، تصميم داكن بلمسة تركوازية/ذهبية

## هيكل المشروع

```
alya-api/
├── prisma/
│   └── schema.prisma        # مخطط قاعدة البيانات (User + RefreshToken)
├── src/
│   ├── config/env.ts        # قراءة متغيرات البيئة
│   ├── lib/                 # prisma client + jwt helpers
│   ├── middleware/          # auth (JWT) + apiKey (x-api-key) + error handling
│   ├── controllers/         # منطق تسجيل الدخول/التسجيل
│   ├── modules/              # نظام الأقسام القابل للتوسّع (اقرأ القسم أدناه)
│   │   ├── types.ts          # تعريف ModuleDefinition
│   │   ├── loader.ts         # يكتشف ويسجّل الوحدات تلقائيًا
│   │   ├── tools/             # قسم "أدوات": base64, uuid, qrcode
│   │   ├── text/              # قسم "نصوص": reverse, case, wordcount
│   │   └── downloads/          # قسم "تحميل": tiktok (معلومات فقط عبر oEmbed الرسمي)
│   ├── routes/               # مسارات الـ API (auth)
│   ├── app.ts                # إعداد Express
│   └── server.ts             # نقطة التشغيل
└── public/                   # الواجهات (HTML + Tailwind CDN + JS عادي)
    ├── login.html
    ├── register.html
    ├── index.html            # لوحة التحكم بعد الدخول
    ├── docs.html              # توثيق تفاعلي لكل الأقسام + تجربة مباشرة
    └── assets/{css,js}
```

## نظام الأقسام (Modules) — انسخ ووسّع

كل قسم هو مجلد داخل `src/modules/`، وكل وحدة بداخله ملف `*.module.ts` يُصدّر (export default) كائنًا من نوع `ModuleDefinition`. لا حاجة لتعديل أي راوتر يدويًا — الملف يُكتشف ويُسجَّل تلقائيًا عند إقلاع الخادم.

**لإضافة وحدة جديدة داخل قسم موجود** (مثلاً `tools`): انسخ أي ملف من `src/modules/tools/` وعدّل المحتوى.

**لإضافة قسم جديد بالكامل**: أنشئ مجلدًا جديدًا داخل `src/modules/` (مثلاً `src/modules/social/`) وضع بداخله ملفات `*.module.ts` بنفس النمط — سيظهر تلقائيًا في `/api/modules/` وفي صفحة `/docs.html`.

مثال لوحدة:

```ts
import { ModuleDefinition } from "../types";

const module: ModuleDefinition = {
  name: "اسم الوحدة",
  description: "وصف مختصر",
  method: "post",       // أو "get"
  path: "/my-endpoint",  // المسار الكامل يصبح: /api/modules/<اسم-المجلد>/my-endpoint
  // public: true,        // فعّلها لو الوحدة لا تحتاج مفتاح API
  handler: (req, res) => {
    res.json({ success: true, data: { ok: true } });
  },
};

export default module;
```

كل وحدة غير `public` تتطلب مفتاح API عبر ترويسة `x-api-key` (نفس المفتاح الظاهر في لوحة التحكم).

> **ملاحظة حول قسم `downloads`:** وحدة `tiktok` تستخدم نقطة oEmbed **الرسمية** من تيك توك، وترجّع معلومات الفيديو (العنوان، الناشر، الصورة المصغّرة، كود embed) وليس رابط تحميل مباشر للفيديو — لأن استخراج ذلك يتطلب طرقًا غير رسمية تخالف شروط استخدام المنصة. إن رغبت بدمج خدمة تحميل مرخّصة تشترك بها، أضف وحدة جديدة بنفس النمط داخل `downloads/`.

## التشغيل محليًا

1. ثبّت الحزم:
   ```bash
   npm install
   ```

2. انسخ ملف البيئة وعدّل القيم (رابط قاعدة بيانات PostgreSQL، مثلاً من Neon):
   ```bash
   cp .env.example .env
   ```

3. أنشئ الجداول في قاعدة البيانات:
   ```bash
   npx prisma migrate dev --name init
   ```

4. شغّل الخادم في وضع التطوير:
   ```bash
   npm run dev
   ```

5. افتح المتصفح على:
   ```
   http://localhost:4000/register.html
   ```

## البناء للإنتاج

```bash
npm run build
npm start
```

## نقاط النهاية (Endpoints)

| الطريقة | المسار              | الوصف                          |
|---------|---------------------|----------------------------------|
| POST    | `/api/auth/register`| إنشاء حساب جديد                 |
| POST    | `/api/auth/login`   | تسجيل الدخول                    |
| POST    | `/api/auth/refresh` | تجديد رمز الدخول                |
| POST    | `/api/auth/logout`  | تسجيل الخروج                    |
| GET     | `/api/auth/me`      | بيانات المستخدم الحالي (يتطلب دخول) |
| GET     | `/api/health`       | التحقق من عمل الخادم            |
| GET     | `/api/modules/`     | قائمة كل الأقسام والوحدات المسجَّلة |
| \*      | `/api/modules/<قسم>/<وحدة>` | استدعاء وحدة معيّنة (يتطلب `x-api-key` غالبًا) |

## ملاحظات النشر

- يمكن نشر الخادم على أي مزود يدعم Node.js (Render, Railway, Vercel Functions مع تعديل، VPS...).
- يفضّل استخدام **Neon PostgreSQL** أو أي قاعدة بيانات PostgreSQL مُدارة.
- تأكد من ضبط `JWT_ACCESS_SECRET` و`JWT_REFRESH_SECRET` بقيم عشوائية قوية، و`CLIENT_ORIGIN` بالنطاق الصحيح قبل النشر.
