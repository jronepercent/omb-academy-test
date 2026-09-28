# OMB Academy — Beta 0.1

แพลตฟอร์มเรียนออนไลน์โทนดำ–แดง สำหรับคอร์สที่ใช้ YouTube พร้อมระบบผู้เรียนและหลังบ้าน

## สถานะของ beta

- **ลองได้ทันที:** `/demo` → คอร์ส → วิดีโอ → กดเรียนจบ/ยกเลิก → เรียนต่อ ความคืบหน้าเก็บใน localStorage ของเบราว์เซอร์นั้น
- **เตรียมโค้ดแล้ว แต่ต้องเชื่อม Supabase:** สมัครสมาชิก, Email/Google Login, ยืนยันอีเมล, ลืม/ตั้งรหัสผ่าน, บัญชี, คอร์สที่ได้รับสิทธิ์, ความคืบหน้าข้ามอุปกรณ์ และหลังบ้าน
- **ยังไม่ได้ทำกับบริการจริง:** สร้าง Supabase/Vercel project, push GitHub, deploy, ยืนยันการส่งอีเมล/Google OAuth กับบัญชีจริง
- ผู้ใช้เลือกให้เตรียมเว็บก่อน เพราะยังไม่มี Supabase และ Vercel ไม่มีการสร้างบัญชีหรือเปิดบริการที่มีค่าใช้จ่าย
- วิดีโอใน demo/seed เป็น placeholder ต้องแทนด้วยวิดีโอสอนจริงก่อนรับผู้เรียน

## เริ่มใช้งานในเครื่อง

ต้องมี Node.js 22+ และ npm

```sh
npm ci
npm run dev
```

เปิด http://127.0.0.1:3000/demo — ไม่ต้องมี key ก็ทดลองหน้าเรียนได้

`npm run dev` และ `npm start` เปิดเฉพาะเครื่องนี้ ไม่ได้เปิดเว็บสาธารณะ

```sh
npm test
npm run typecheck
npm run lint
npm run build
npm start
```

## เทคโนโลยีและโครงสร้าง

Next.js 16 App Router, React, TypeScript, Tailwind CSS 4, ปุ่มแนว shadcn/ui ที่ใช้ Radix Slot, Lucide, Supabase SSR + PostgreSQL RLS

```text
app/                  หน้าเว็บ, Server Actions, Auth callbacks
components/           หน้าเรียน, ฟอร์ม, shell และ UI ที่ใช้ร่วมกัน
lib/supabase/         Browser/Server clients
lib/auth.ts           ตรวจผู้ใช้และ admin บน server
lib/data.ts           ดึงคอร์สผ่าน RLS
lib/types.ts          โครงสร้างข้อมูลและคำนวณ progress/continue
supabase/migrations/  schema, indexes, triggers และ RLS
supabase/seed.sql      คอร์สตัวอย่าง 3 หมวด 9 บท
tests/                ทดสอบ progress/YouTube และ RLS ด้วย PostgreSQL ใน PGlite
```

## เชื่อม Supabase

1. สร้าง project ในบัญชี Supabase ของคุณ
2. เปิด SQL Editor แล้วรัน `supabase/migrations/001_initial.sql` **ครั้งเดียวในฐานข้อมูลใหม่**
3. รัน `supabase/seed.sql` หากต้องการ ONE MAN BUSINESS ตัวอย่าง (รันซ้ำได้)
4. คัดลอก `.env.example` เป็น `.env.local` และใส่ค่า:

| ตัวแปร                                 | ค่า                                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | URL project จาก Supabase                                                               |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key สำหรับ client                                                          |
| `NEXT_PUBLIC_SITE_URL`                 | URL เว็บจริง เช่น `https://your-project.vercel.app`; local ใช้ `http://127.0.0.1:3000` |

**ไม่ใช้ service-role key** แอปเรียกฐานข้อมูลผ่าน session ของผู้ใช้ และให้ RLS ตรวจสิทธิ์ทุกครั้ง ห้ามใส่ service-role key ในตัวแปร `NEXT_PUBLIC_*`

5. Supabase Authentication → URL Configuration: ตั้ง Site URL ให้ตรงกับเว็บ และเพิ่ม Redirect URLs:
   - `http://127.0.0.1:3000/auth/callback`
   - `http://127.0.0.1:3000/auth/callback?next=/reset-password`
   - `https://YOUR_DOMAIN/auth/callback`
   - `https://YOUR_DOMAIN/auth/callback?next=/reset-password`
6. เปิด Email provider และการยืนยันอีเมล ตรวจการตั้งค่า SMTP/ขีดจำกัดการส่งอีเมลก่อนรับผู้เรียนจริง
7. รีสตาร์ต dev server หลังแก้ `.env.local`; หากเป็น production ต้อง build/deploy ใหม่ เพราะ public environment variables ถูกฝังตอน build

### Google Login

1. สร้าง OAuth client ประเภท Web application ใน Google Cloud และตั้ง consent screen
2. ใส่ Authorized redirect URI ตาม callback ที่ Supabase แสดง เช่น `https://PROJECT_REF.supabase.co/auth/v1/callback`
3. ใส่ Client ID และ Client Secret ใน **Supabase Google provider เท่านั้น** ไม่ใส่ใน repo หรือ frontend
4. หาก Google app ยังอยู่ Testing ให้เพิ่ม test users; เมื่อพร้อมเปิดจริงให้จัดการสถานะ consent screen ตามที่ Google กำหนด
5. ทดสอบปุ่ม Google จาก `/login` หลังตั้งค่า Redirect URLs ครบ

### สร้าง admin และ student

สมัครผ่าน `/register` และยืนยันอีเมลตามปกติ ทุกบัญชีใหม่เป็น student แม้ส่ง metadata ว่าเป็น admin ก็ตาม ไม่มีรหัสผ่านตายตัวในซอร์ส

ยกระดับบัญชีเจ้าของด้วย SQL Editor หลังสมัครแล้ว:

```sql
-- แทนที่อีเมลตัวอย่างด้วยบัญชีเจ้าของจริง ตรวจให้ตรงก่อนรัน
update public.profiles set role = 'admin'
where email = 'YOUR_ADMIN_EMAIL';
```

ให้บัญชีนักเรียนอีกบัญชีคง role เป็น student แล้วล็อกอิน admin → `/admin/users` → เลือกผู้เรียน → เลือกคอร์ส → เพิ่มรายการ

## ฐานข้อมูล

| ตาราง             | หน้าที่/ความสัมพันธ์                                     |
| ----------------- | -------------------------------------------------------- |
| `profiles`        | 1:1 กับ auth.users; ชื่อ อีเมล รูป และ role              |
| `courses`         | ชื่อ, slug ไม่ซ้ำ, คำอธิบาย, ปก, draft/published         |
| `modules`         | หมวดในคอร์ส พร้อม position                               |
| `lessons`         | บทในหมวด, URL/ID YouTube, duration, position, is_preview |
| `enrollments`     | สิทธิ์เข้าเรียน; unique(user_id, course_id)              |
| `lesson_progress` | ความคืบหน้ารายบท; unique(user_id, lesson_id)             |

ทุกตารางเปิด RLS นักเรียนเห็นคอร์ส published ที่ได้รับสิทธิ์เท่านั้น อ่านโปรไฟล์/ความคืบหน้าของตัวเอง และอัปเดตเฉพาะชื่อกับรูปโปรไฟล์ ไม่สามารถแก้ role/email ผ่าน REST หรือให้สิทธิ์ตัวเองได้

การถอนสิทธิ์/เปลี่ยนเป็น draft ปิดการอ่านบทเรียนและการเขียน progress เดิมทันทีเมื่อมีคำขอใหม่ ความคืบหน้าเดิมเก็บไว้กรณีคืนสิทธิ์ ภาพ/วิดีโอที่ผู้ใช้เปิดไปแล้วไม่สามารถเรียกกลับได้

Admin จัดการคอร์ส หมวด บทเรียน และสิทธิ์; ตรวจ role ทั้งใน server page และทุก Server Action กฎฐานข้อมูลเป็นชั้นป้องกันเพิ่มเติม

`is_preview` เก็บได้ใน beta แต่ **ยังไม่เปิดบทให้บุคคลภายนอก** เพื่อรักษาข้อกำหนด enrolled-only ส่วน `last_watched_seconds` เตรียมไว้ แต่ beta กลับไปยังบทล่าสุด ไม่ได้บันทึกตำแหน่งวิดีโอระดับวินาที

เปอร์เซ็นต์คำนวณจากจำนวนบทที่ completed ไม่เก็บค่าเปอร์เซ็นต์ซ้ำ การเรียนต่อเลือกบทที่เปิดล่าสุดและยังไม่จบ แล้วจึงบทแรกที่ยังไม่จบ หากเรียนครบจะเปิดให้ทบทวน

## จัดการคอร์ส

1. `/admin/courses` → คอร์สใหม่: ใส่ชื่อ, slug ตัวเล็กภาษาอังกฤษ, คำอธิบาย, URL ปก https และสถานะ
2. บันทึกคอร์สก่อน แล้วเพิ่มหมวด
3. เพิ่มบทเรียนในหมวด ใส่ลิงก์ YouTube (watch / youtu.be / embed / shorts), ชื่อ, รายละเอียด, เวลา และลำดับ
4. ใช้เลข position เพื่อจัดเรียงหมวด/บทจากน้อยไปมาก ไม่จำเป็นต้องเรียงเลขติดกัน
5. เปลี่ยนสถานะเป็น published แล้วให้สิทธิ์ผู้เรียนที่ `/admin/users`
6. ลบมีหน้าต่างยืนยัน การลบคอร์ส/หมวด/บทลบข้อมูลลูกและ progress ที่เกี่ยวข้องด้วย ใช้ draft หากเพียงต้องการซ่อนคอร์ส

รูปปกเป็น URL ไม่ใช่ระบบอัปโหลดไฟล์ใน beta วิดีโอโหลดจาก YouTube โดยตรง ไม่เก็บไฟล์ในเซิร์ฟเวอร์ ใช้ `youtube-nocookie.com` และ iframe แบบ 16:9

## GitHub และ Vercel

Repo ในเครื่องพร้อม `.gitignore`, lockfile และ `.env.example` แล้ว ยังไม่มี remote GitHub ของโปรเจกต์นี้

1. สร้าง **private repository** ในบัญชี GitHub ของคุณ
2. เชื่อม remote แล้ว push branch ที่ต้องการ เช่น:

```sh
git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
git push -u origin HEAD
```

3. Vercel → Add New Project → Import repository → framework Next.js
4. ตั้ง environment variables ทั้ง 3 ตัวด้านบนให้ครบก่อน Deploy
5. ตั้ง production branch ให้ตรงกับ branch ที่ push
6. อัปเดต Supabase Site URL และ Redirect URLs เป็นโดเมน Vercel
7. หลังแก้ env ให้ Redeploy จากนั้น push รอบถัดไปจะ deploy อัตโนมัติ

ไม่ต้องมี Vercel config พิเศษ ใช้ `npm run build` ตามค่าเริ่มต้นของ Next.js

## การตรวจรับก่อนเชิญผู้เรียนจริง

ทดสอบอัตโนมัติในเครื่องใช้ PGlite (PostgreSQL) รัน migration/seed จริง แต่จำลอง auth schema/roles จึงไม่แทนการทดสอบ Supabase Auth และบริการอีเมล/OAuth จริง

- สมัคร/ยืนยันอีเมล/เข้าสู่ระบบ/ออกจากระบบและลิงก์ลืมรหัสผ่าน
- Google Login ด้วยบัญชีที่อนุญาต
- student เปิด `/admin` ไม่ได้ และเปิดคอร์สที่ไม่ได้รับสิทธิ์ไม่ได้
- admin เพิ่มคอร์ส/หมวด/บท, จัดลำดับ, ให้/ถอนสิทธิ์ และ publish/unpublish
- student กดจบบท, ยกเลิก, รีโหลด และกลับมาเรียนต่อในอุปกรณ์อื่น
- เปลี่ยนวิดีโอ placeholder ให้ครบ และตรวจว่าเปิดให้ embed ได้
- ตรวจ mobile และ deploy URL จริง

## ขอบเขตที่ยังไม่รวม

Payment, community, chat, certificate, email automation, analytics ขั้นสูง, อัปโหลดวิดีโอ/รูป, และระบบ DRM ไม่รวมใน beta ตามบรีฟ

## Stripe payment → เปิดคอร์สอัตโนมัติ

โค้ดมี webhook ที่ `POST /api/stripe/webhook` แล้ว เมื่อได้รับ `checkout.session.completed` หรือ `payment_intent.succeeded` จะหา profile จากอีเมลผู้ชำระ และ upsert สิทธิ์ใน `enrollments` โดยใช้ `metadata.course_id` เป็น UUID ของคอร์ส

ตั้งค่าใน Vercel (ห้าม commit ค่าเหล่านี้): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` และใช้ URL webhook `https://YOUR_DOMAIN/api/stripe/webhook` ใน Stripe Dashboard → Developers → Webhooks เลือก event `checkout.session.completed` (แนะนำ) และ `payment_intent.succeeded` หากใช้งาน Payment Intent โดยตรง

ตอนสร้าง Checkout Session ให้ใส่ metadata เช่น `{ course_id: "10000000-0000-4000-8000-000000000001" }` ทั้งที่ session และ PaymentIntent metadata ถ้าใช้ payment intent. ต้องให้อีเมลใน Stripe ตรงกับอีเมลบัญชี OMB ที่สมัครไว้ก่อน ระบบจะไม่สร้างบัญชีใหม่หรือเปิดสิทธิ์จากอีเมลที่ไม่พบ และ webhook ตรวจลายเซ็น Stripe ทุกครั้ง

หลังเชื่อมบริการจริง ขั้นถัดไปคือทดสอบ end-to-end ด้วย admin/student จริง และเปลี่ยนชื่อแบรนด์/คอร์ส/วิดีโอตามเนื้อหาของคุณ

## เอกสารอ้างอิง

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase SSR client](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase Google Login](https://supabase.com/docs/guides/auth/social-login/auth-google)
