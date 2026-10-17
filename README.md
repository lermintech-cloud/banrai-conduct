# ระบบบันทึกคะแนนความประพฤตินักเรียน โรงเรียนบ้านไร่

## โครงสร้างไฟล์ (แก้ไขง่าย)
| ไฟล์ | หน้าที่ |
|---|---|
| `public/index.html` | โครงหน้าเว็บ |
| `public/css/style.css` | ธีมสีสว่าง (เปลี่ยนสีที่ตัวแปรบนสุด `--pri`, `--pri2`, `--gold`) |
| `public/css/print.css` | รูปแบบพิมพ์ A4 (ขอบ 3/2/2.5/2 ซม., TH Sarabun New 16pt) |
| `public/js/rules.js` | **รายการความผิด/คะแนนที่ตัดและเพิ่ม** |
| `public/js/app.js` | แดชบอร์ด ฟอร์มบันทึก ทะเบียนนักเรียน ตั้งค่า |
| `public/js/history.js` | ประวัติบันทึก ส่งออก CSV กราฟสถิติ |
| `public/js/reports.js` | เอกสารราชการ: บันทึกข้อความ, หนังสือแจ้งผู้ปกครอง, ตารางรายงาน |
| `public/js/api.js` | เชื่อมต่อฐานข้อมูล + หน้าเข้าสู่ระบบ |
| `public/assets/` | โลโก้โรงเรียน, ตราครุฑ |
| `functions/api/[[path]].js` | API (Cloudflare Pages Functions) |
| `schema.sql` | ตารางฐานข้อมูล D1 |

## ติดตั้ง: GitHub + Cloudflare (ไม่ต้องใช้คำสั่ง)
**1) ขึ้น GitHub**
1. github.com → New repository → ตั้งชื่อ `banrai-conduct` → Private → Create
2. แตกไฟล์ zip แล้วลาก **เนื้อหาในโฟลเดอร์** (`public`, `functions`, `schema.sql`, `README.md`, …) ไปวางที่หน้า repo (Add file → Upload files) → Commit changes
   (ต้องเห็นโฟลเดอร์ `public` และ `functions` อยู่ที่ชั้นนอกสุดของ repo)

**2) สร้างฐานข้อมูล D1**
1. dash.cloudflare.com → Storage & Databases → D1 SQL Database → Create → ชื่อ `banrai-conduct`
2. เปิดฐานข้อมูล → แท็บ Console → วางเนื้อหาไฟล์ `schema.sql` ทั้งหมด → Execute

**3) สร้างเว็บ (Pages)**
1. Workers & Pages → Create → แท็บ Pages → Connect to Git → เลือก repo `banrai-conduct`
2. Build command: เว้นว่าง · **Build output directory: `public`** → Save and Deploy

**4) ผูกฐานข้อมูลและตั้งรหัสผ่าน** (ที่โปรเจกต์ Pages → Settings)
1. Bindings → Add → D1 database → Variable name **`DB`** → เลือก `banrai-conduct`
2. Variables and Secrets → Add (ชนิด Secret): **`ADMIN_PASSWORD`** (รหัสผู้ดูแล) และ **`TEACHER_PASSWORD`** (รหัสครู)
3. Deployments → ⋯ ที่ deployment ล่าสุด → Retry deployment (เพื่อให้ค่าที่ตั้งมีผล)

เปิด `https://ชื่อโปรเจกต์.pages.dev` แล้วเข้าสู่ระบบ
- ผู้ดูแล: ทำได้ทุกอย่าง (ตั้งค่า, นำเข้านักเรียน, ลบ, สำรองข้อมูล)
- ครู: ดูข้อมูลและบันทึกตัด/เพิ่มคะแนนได้เท่านั้น

**5) ตั้งค่าครั้งแรก** — เมนู ตั้งค่า: ใส่ชื่อ ผอ., หัวหน้างานกิจการนักเรียน, ที่อยู่, โทรศัพท์, เลขที่หนังสือ → เมนู ทะเบียนนักเรียน: วางรายชื่อจาก Excel (รหัส,ชื่อ,ชั้น)

**อัปเดตระบบภายหลัง:** แก้ไฟล์บน GitHub → Commit → Cloudflare ปรับเว็บให้อัตโนมัติ

## ติดตั้งด้วยคำสั่ง (ทางเลือก)
```
npx wrangler login
npx wrangler d1 create banrai-conduct      # คัดลอก database_id
mv wrangler.toml.example wrangler.toml     # ใส่ database_id
npx wrangler d1 execute banrai-conduct --remote --file=schema.sql
npx wrangler pages project create banrai-conduct --production-branch main
npx wrangler pages deploy
npx wrangler pages secret put ADMIN_PASSWORD --project-name banrai-conduct
npx wrangler pages secret put TEACHER_PASSWORD --project-name banrai-conduct
```

## พิมพ์/บันทึก PDF
เมนู รายงาน → เลือกประเภท → ปุ่ม “พิมพ์ / บันทึก PDF” → ปลายทาง **บันทึกเป็น PDF** (หรือเลือกเครื่องพิมพ์) · ขนาด A4 · มาตราส่วน 100% (ค่าเริ่มต้น)
ถ้าต้องการเลขอารบิก ให้ยกเลิกติ๊ก “เลขไทย”

## ข้อควรรู้
- เกณฑ์ในระบบอ้างอิงระเบียบโรงเรียนขนอมพิทยา (ไฟล์ตัวอย่าง) — ปรับให้ตรงระเบียบของโรงเรียนบ้านไร่ได้ใน `rules.js`
- เปิด `public/index.html` โดยตรงในเครื่อง = โหมดทดสอบ เก็บข้อมูลในเบราว์เซอร์
- สำรองข้อมูลเป็นไฟล์ JSON ได้ที่เมนู ตั้งค่า (ควรสำรองเป็นระยะ)
