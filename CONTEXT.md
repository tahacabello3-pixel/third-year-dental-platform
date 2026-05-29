# 🦷 DentalEd Platform — Complete Project Context
> انسخ هذا الملف كاملاً في بداية أي شات جديد مع Claude

---

## 📋 معلومات المشروع

- **اسم المشروع:** Third-Year Dental Medicine & Oral Surgery Platform
- **Repository:** `third-year-dental-platform`
- **GitHub Username:** `tahacabello3-pixel`
- **رابط الموقع:** `https://tahacabello3-pixel.github.io/third-year-dental-platform/`
- **Admin Email:** `tahacabello3@gmail.com`
- **لغة الواجهة:** English — LTR
- **الديزاين:** Dark Mode

---

## 🗄️ Supabase

- **Project Name:** Dental Platform
- **Supabase URL:** `https://mlktcfrsbkqcutzzvczt.supabase.co`
- **Anon Key:** `sb_publishable_Np670cPyIUxgV2pmsDlbWQ_hweoXfGc`

---

## 📁 الملفات على GitHub (آخر تحديث)

| الملف | الوصف |
|---|---|
| `index.html` | صفحة تسجيل الدخول — خانة موحدة (إيميل/رقم قيد/هاتف) |
| `signup.html` | صفحة التسجيل — 3 خطوات + شخصيتان أسنان بعيون متحركة |
| `dashboard.html` | لوحة الطالب — 12 مادة + إعلانات مثبتة + Edit Profile |
| `subjects.html` | قائمة المواد الـ 12 |
| `subject.html` | صفحة مادة واحدة — تبويبان + أدمن + زر Quiz |
| `quiz.html` | نظام الاختبار الذاتي — MCQ/TF/Written |
| `profile.html` | تعديل الملف الشخصي + تغيير كلمة المرور ✅ مُصلَح |
| `announcements.html` | صفحة الإعلانات — أدمن يضيف/يحذف |
| `style.css` | كل الستايل — Dark Mode كامل |
| `app.js` | كل منطق Auth والمحتوى والـ routing |
| `supabase.js` | إعدادات Supabase (URL + anon key حقيقية) |

---

## 🗃️ جداول Supabase (كلها منشأة)

### profiles
```sql
id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
full_name TEXT NOT NULL
student_id TEXT NOT NULL
phone TEXT
university TEXT NOT NULL
faculty TEXT NOT NULL
academic_year TEXT DEFAULT 'Third Year'
email TEXT NOT NULL
created_at TIMESTAMPTZ DEFAULT NOW()
```

### subject_content
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
subject_id TEXT NOT NULL
section TEXT NOT NULL  -- 'previous_exams' | 'midterm_quizzes'
title TEXT NOT NULL
type TEXT NOT NULL     -- 'text' | 'image' | 'pdf'
content TEXT
file_url TEXT
file_name TEXT
sort_order INT DEFAULT 0
created_at TIMESTAMPTZ DEFAULT NOW()
created_by UUID REFERENCES auth.users(id)
```

### questions
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
subject_id TEXT NOT NULL
section TEXT NOT NULL
type TEXT NOT NULL     -- 'mcq' | 'tf' | 'written'
question TEXT NOT NULL
option_a TEXT
option_b TEXT
option_c TEXT
option_d TEXT
correct TEXT NOT NULL
explanation TEXT
sort_order INT DEFAULT 0
created_at TIMESTAMPTZ DEFAULT NOW()
created_by UUID REFERENCES auth.users(id)
```

### quiz_attempts
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
student_id UUID REFERENCES auth.users(id)
subject_id TEXT NOT NULL
section TEXT NOT NULL
score INT NOT NULL
total INT NOT NULL
created_at TIMESTAMPTZ DEFAULT NOW()
```

### announcements
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
title TEXT NOT NULL
body TEXT NOT NULL
type TEXT DEFAULT 'info'  -- 'info' | 'warning' | 'success' | 'urgent'
pinned BOOLEAN DEFAULT false
created_at TIMESTAMPTZ DEFAULT NOW()
created_by UUID REFERENCES auth.users(id)
```

---

## 📚 المواد الـ 12

| Subject ID | الاسم |
|---|---|
| `oral-pathology` | Oral Pathology |
| `general-surgery` | General Surgery |
| `general-medicine` | General Medicine |
| `conservative` | Conservative Dentistry & Endo |
| `pedodontics` | Pedodontics |
| `orthodontics` | Orthodontics |
| `prosthodontics` | Prosthodontics — Removable |
| `crown-bridge` | Crown & Bridge — Fixed |
| `prevention` | Prevention & Community |
| `oral-medicine` | Oral Medicine |
| `periodontology` | Periodontology |
| `oral-surgery` | Oral Surgery |

---

## 🔐 نظام الصلاحيات

- **الطلاب:** يسجلون، يدخلون بإيميل أو رقم قيد أو هاتف، يشوفون المحتوى والأسئلة، يمتحنون أنفسهم
- **الأدمن** (`tahacabello3@gmail.com`): يضيف/يحذف محتوى وأسئلة وإعلانات
- **كلمات المرور:** Supabase Auth فقط
- **RLS:** مفعّل على كل الجداول

---

## 🏗️ هيكل الصفحات

```
index.html                    ← Login
signup.html                   ← Sign Up (3 steps + tooth characters)
dashboard.html                ← Student Dashboard
subjects.html                 ← All 12 subjects list
subject.html?id=X             ← Single subject page
quiz.html?subject=X&section=Y ← Quiz screen
profile.html                  ← Edit profile + change password
announcements.html            ← Announcements
```

---

## ✅ المميزات المبنية

- [x] Auth كامل — تسجيل/دخول/خروج
- [x] تسجيل دخول بـ إيميل أو رقم قيد أو هاتف
- [x] حماية الصفحات
- [x] Dashboard مع 12 بطاقة مواد
- [x] صفحة لكل مادة مع تبويبين (Previous Exams / Midterm Quizzes)
- [x] لوحة أدمن لإضافة محتوى (نص/صورة/PDF)
- [x] نظام أسئلة MCQ / True-False / Written
- [x] اختبار ذاتي مع نتيجة فورية
- [x] تعديل الملف الشخصي + تغيير كلمة المرور
- [x] نظام إعلانات مع pin
- [x] صفحة تسجيل بـ 3 خطوات مع شخصيتان أسنان متحركة
- [x] Dark Mode كامل
- [x] Responsive للموبايل
- [x] Bottom Navigation Bar للموبايل — SVG icons مع bounce + ripple + dot animations
- [x] Welcome message يعرض اسم الطالب الحقيقي بدل الإيميل
- [x] رسالة واضحة + زر رجوع في صفحة Quiz لو ما في أسئلة
- [x] Bottom Navigation Bar للموبايل — SVG icons مع animations (bounce + ripple + dot indicator)

---

## 🔜 أفكار لم تُبنَ بعد

- [ ] صفحة نتائج الاختبارات السابقة للطالب
- [ ] بحث في الأسئلة والمحتوى

---

## 🐛 البق المُصلَحة


### ✅ إضافة Bottom Navigation Bar للموبايل (May 2026)
**التغيير:** على شاشات الموبايل (أقل من 900px) يختفي الـ navbar العادي ويظهر شريط تنقل ثابت في أسفل الشاشة.

**الملفات المعدلة:**
- `style.css` — أضيف CSS كامل للـ bottom nav مع animations
- `dashboard.html`, `subjects.html`, `subject.html`, `announcements.html`, `profile.html`, `quiz.html` — أضيف الـ HTML والـ JS في كل صفحة

**المميزات:**
- SVG icons نظيفة بدون emoji
- Bounce animation عند الضغط على الـ active item
- Ripple effect عند التنقل
- Blue dot indicator تحت الأيقونة النشطة
- Glassmorphism background (blur)
- Active state يتحدد تلقائياً حسب الصفحة الحالية



### ✅ إضافة Admin في Bottom Navigation Bar (May 29, 2026)
**التغيير:** أضيف زر Admin بأيقونة نجمة ⭐ بلون أصفر في الـ bottom nav.
**الملفات:** `dashboard.html`, `subjects.html`, `subject.html`, `announcements.html`, `profile.html`, `quiz.html`
**التفاصيل:** يظهر فقط للأدمن (`tahacabello3@gmail.com`) — الطلاب العاديين لا يرونه.

### ✅ إصلاح RLS policy على جدول profiles (May 29, 2026)
**المشكلة:** الأدمن كان يشوف طالب واحد بس في لوحة التحكم.
**الحل:** تعديل policy في Supabase SQL Editor:
```sql
DROP POLICY IF EXISTS "view_own" ON public.profiles;
CREATE POLICY "view_profiles" ON public.profiles
FOR SELECT USING (
  auth.uid() = id
  OR
  auth.jwt() ->> 'email' = 'tahacabello3@gmail.com'
);
```

### ✅ Bottom Navigation Bar للموبايل (May 2026)
**التغيير:** على شاشات الموبايل يظهر شريط تنقل ثابت في الأسفل بـ SVG icons وanimations.
**الملفات:** `style.css` + `dashboard.html`, `subjects.html`, `subject.html`, `announcements.html`, `profile.html`, `quiz.html`
**المميزات:** Bounce animation، Ripple effect، Blue dot indicator، Glassmorphism background.

### ✅ إصلاح Welcome message يعرض إيميل بدل الاسم (May 2026)
**المشكلة:** لو المستخدم ما عبّى بروفايله، كان يظهر الإيميل الكامل في "Welcome back".
**الحل:** يعرض الجزء قبل @ من الإيميل كـ fallback بدل الإيميل الكامل.
**الملفات:** كل صفحات HTML.

### ✅ تحسين صفحة Quiz — حالة لا يوجد أسئلة (May 2026)
**التغيير:** الرسالة صارت أوضح + أضيف زر "Back to Subject" مباشرة.

### ✅ بيانات البروفايل تختفي بعد التعديل (مُصلَح — May 2026)
**المشكلة:** بعد تعديل البروفايل (university, faculty, student_id, phone) والرجوع للداشبورد، كانت البيانات تظهر كـ `—` كأنها لم تُحفظ.

**السبب:** كان الكود يستخدم `.update()` في Supabase بدون `WITH CHECK` في RLS policy، فكانت العملية تنجح ظاهرياً لكن التغييرات لا تُطبَّق فعلياً.

**الحل:**
1. في `profile.html` — استبدال `.update()` بـ `.upsert()` مع كل حقول البروفايل + إضافة verify بعد الحفظ للتأكد من وصول البيانات.
2. في Supabase — تعديل RLS policy على جدول `profiles` لإضافة `WITH CHECK (auth.uid() = id)` على policy الـ UPDATE.

---

## ⚙️ كل SQL المطلوب (إذا بدأت من صفر)

```sql
-- 1. profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL, student_id TEXT NOT NULL,
  phone TEXT, university TEXT NOT NULL, faculty TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT 'Third Year',
  email TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_own"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON public.profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- 2. subject_content
CREATE TABLE IF NOT EXISTS public.subject_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id TEXT NOT NULL, section TEXT NOT NULL,
  title TEXT NOT NULL, type TEXT NOT NULL,
  content TEXT, file_url TEXT, file_name TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.subject_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_content"   ON public.subject_content FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_insert"   ON public.subject_content FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'tahacabello3@gmail.com');
CREATE POLICY "admin_update"   ON public.subject_content FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' = 'tahacabello3@gmail.com');
CREATE POLICY "admin_delete"   ON public.subject_content FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = 'tahacabello3@gmail.com');

-- 3. questions
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id TEXT NOT NULL, section TEXT NOT NULL,
  type TEXT NOT NULL, question TEXT NOT NULL,
  option_a TEXT, option_b TEXT, option_c TEXT, option_d TEXT,
  correct TEXT NOT NULL, explanation TEXT, sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_q"   ON public.questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_insert_q" ON public.questions FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'tahacabello3@gmail.com');
CREATE POLICY "admin_update_q" ON public.questions FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' = 'tahacabello3@gmail.com');
CREATE POLICY "admin_delete_q" ON public.questions FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = 'tahacabello3@gmail.com');

-- 4. quiz_attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL, section TEXT NOT NULL,
  score INT NOT NULL, total INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_own_attempts"   ON public.quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "insert_own_attempts" ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

-- 5. announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_ann"   ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_insert_ann" ON public.announcements FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'tahacabello3@gmail.com');
CREATE POLICY "admin_update_ann" ON public.announcements FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' = 'tahacabello3@gmail.com');
CREATE POLICY "admin_delete_ann" ON public.announcements FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = 'tahacabello3@gmail.com');

-- 6. Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('content-files', 'content-files', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "public_read_files"  ON storage.objects FOR SELECT USING (bucket_id = 'content-files');
CREATE POLICY "admin_upload_files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'content-files' AND auth.jwt() ->> 'email' = 'tahacabello3@gmail.com');
CREATE POLICY "admin_delete_files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'content-files' AND auth.jwt() ->> 'email' = 'tahacabello3@gmail.com');
```

---

*آخر تحديث: May 29, 2026*
