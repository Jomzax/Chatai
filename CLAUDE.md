# คำแนะนำสำหรับ AI ในโปรเจคนี้

## เป้าหมายโปรเจค

สร้าง Web Application ที่มี 4 หน้า:

1. **Login Page** — ใช้ mock user ได้ (admin / admin123)
2. **Chat Page** — คุยกับ AI (Claude API / OpenAI API หรือ free alternative)
3. **Upload Page** — อัปโหลดเอกสาร (PDF/TXT) แล้วถามคำถามเกี่ยวกับเอกสารได้
4. **Token Usage** — แสดง token ที่ใช้ในแต่ละข้อความ

##
ให้ไปดู D:\โปรเจคภาษาต่างๆ\chatai\.claude\skills ว่ามีskill อะไรบ้างแล้วหยิบมาใช้

## Tech Stack (เลือกใช้แน่นอน)

- **Frontend:** Next.js
- **Backend:** Express.js (แยกจาก frontend)
- **Database:** MongoDB
- **AI API:** Claude API หรือ Gemini API
- **Authentication:** JWT + bcrypt
- **Deploy:** Docker Compose (ต้องรันด้วย `docker compose up` เดียว)
- **Vector DB (ถ้าทำ RAG):** Chroma, Pinecone, Qdrant ฯลฯ

## ขอบเขตงาน

- **Required Features:** ต้องทำให้ครบทั้ง 5 ข้อ (30 คะแนน)
- **Bonus Features:** เลือกทำหลังจาก Required เสร็จ — เป้าหมาย 20 คะแนน

## โครงสร้าง Frontend (Next.js 16 App Router)

**ให้ยึดโครงสร้างนี้ folder เหล่านี้และจะสร้างเพิ่มได้ถ้ามันเหมาะสมกับงาน  — ผู้ใช้ตัดสินใจไว้แล้ว**

```
frontend/src/
├── app/          ← Next.js routing (page.tsx, layout.tsx, login/) — บังคับ
├── api/          ← API client functions (เรียก backend Express)
├── assets/       ← รูป/ไฟล์ที่ import เข้าโค้ด
├── components/   ← UI components ใช้ซ้ำ
├── hooks/        ← React hooks (useAuth.ts ฯลฯ)
├── lib/          ← utilities, helpers, constants
├── types/        ← TypeScript types (interface, type)
└── validators/   ← form/data validators (zod, yup)
```

### กติกาเพิ่มเติม

- **ไฟล์ใหม่ทุกตัวต้องอยู่ใน folder ที่เหมาะสม** ห้ามทิ้ง root หรือสร้าง folder ใหม่นอกรายการนี้โดยไม่ขออนุญาต
- **ห้ามใช้** `pages/`, `routes/`, `templates/`, `@types/`, `themes/`, `utils/` — เคยมีแล้วลบไป
- **ห้ามสร้าง** `app.tsx`, `main.tsx`, `index.html`, `vite-env.d.ts` — ขัดกับ Next.js
- ลิงก์ภายใน app ใช้ `next/link` ไม่ใช้ `<a>`
- Icons ใช้ `lucide-react` (ติดตั้งแล้ว)
- ไฟล์เปล่าที่อยากให้ Git track ใส่ `.gitkeep`

## Required Features (30 คะแนน — ต้องทำทั้งหมด)

| # | Feature | คะแนน | เกณฑ์เต็ม |
|---|---|---|---|
| 1 | Login + Protected Routes | 5 | ครบ + secure (bcrypt, session mgmt) |
| 2 | Upload File (PDF, TXT) | 5 | ครบ + validate type/size + sanitize path |
| 3 | Chat with AI (basic) | 5 | ครบ + error handling + timeout |
| 4 | Chat with Uploaded File Context | 10 | ครบ + ทำงานแม่นยำ + handle ไฟล์ใหญ่ |
| 5 | Token Usage Counter | 5 | ครบ + แสดง total ต่อ session |

## Bonus Features (20 คะแนน — เลือกทำ cap ที่ 20)

| # | Feature | คะแนน |
|---|---|---|
| A | Markdown rendering ในคำตอบ AI | 3 |
| B | Citation (แสดงที่มาจากเอกสาร) | 5 |
| C | Streaming response | 3 |
| D | RAG with Vector DB (chunking + embedding + retrieval) | 8 |
| E | Conversation history (save/load) | 3 |
| F | Rate limiting / API key rotation | 3 |
| G | Docker Compose + Healthcheck | 3 |
| H | Unit tests (coverage ≥ 40%) | 5 |

## Code Quality (15 คะแนน)

| มิติ | คะแนน | เกณฑ์เต็ม |
|---|---|---|
| Code Structure & Clean Code | 5 | มี layering (route/service/repo), naming ดี, ไม่มี god file |
| Security Hardening | 5 | input validation + no hardcoded key + CORS + sanitization ครบ |
| Git Commit History | 5 | commit แยกขั้นตอน, message เขียนดี, logical unit |

---

## บันทึก AI Journal อัตโนมัติ

**ทุกครั้งที่ตอบคำถามผู้ใช้เสร็จ** ให้เพิ่ม Session ใหม่ต่อท้ายไฟล์ `AI_JOURNAL.md` ที่ root ของโปรเจคโดยอัตโนมัติ ไม่ต้องรอให้ผู้ใช้สั่ง

### รูปแบบที่ต้องใช้ (ภาษาไทย)

```
## Session {N}: {หัวข้อสั้นๆ}
**คำถามที่ถาม AI:** {คำถามของผู้ใช้}
**AI ตอบว่า:** {สรุปคำตอบในประโยคเดียว}
**สิ่งที่เราปรับเอง:** {สิ่งที่ผู้ใช้แก้/ปรับเอง หรือ "-" ถ้าไม่มี}
```

### ขั้นตอน

1. อ่าน `AI_JOURNAL.md` เพื่อดูว่ามี Session ถึงเลขอะไรแล้ว
2. ใช้เลข Session ถัดไป
3. ใช้ Edit แบบ append — ห้ามเขียนทับ ห้ามลบของเก่า
4. สรุปสั้นๆ ในประโยคเดียวพอ ไม่ต้องคัดลอกทั้งหมด
5. ให้เขียนต่อจาก Session {N} ล่า สุดไม่ต้องเขียนย้อนหลัง

### ข้อยกเว้น (ไม่ต้องบันทึก)

- คำถามที่เกี่ยวกับการแก้ `AI_JOURNAL.md` หรือ skill `journal` เอง (เพื่อหลีกเลี่ยง loop)
- คำทักทายสั้นๆ ที่ไม่มีเนื้อหา เช่น "สวัสดี", "ขอบคุณ"
- ไม่บันทึกค่า API key จริงลง journal  เพื่อหลีกเลี่ยงการเก็บ secret ในโค้ดหรือ log

