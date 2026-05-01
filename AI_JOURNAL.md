# บันทึกการใช้งาน AI

## Session 1: สร้างระบบบันทึก AI Journal อัตโนมัติ
**คำถามที่ถาม AI:** "จะทำยังไงให้ AI บันทึก AI_JOURNAL.md ให้ตลอดทุกการถาม หรือสร้างโฟลเดอร์ skills ดีกว่าไหม"
**AI ตอบว่า:** แนะนำสร้าง custom skill/slash command แทนการใช้ hook อัตโนมัติ เพราะคุมได้ดีกว่า แล้วสร้างไฟล์ `.claude/skills/journal/SKILL.md` (พร้อม template.md และ examples/sample.md) และ `.claude/commands/journal.md` ให้พิมพ์ `/journal` เรียกใช้ได้
**สิ่งที่เราปรับเอง:** ทักว่าโครงสร้างที่ถูกต้องคือ `.claude/skills/<skill-name>/SKILL.md` ตามเอกสารทางการ ไม่ใช่ `.claude/commands/` อย่างที่ AI แนะนำตอนแรก

## Session 2: ทดสอบระบบบันทึก AI Journal
**คำถามที่ถาม AI:** "ทดสอบระบบบันทึก AI Journal ว่าทำงานไหม"
**AI ตอบว่า:** เพิ่ม Session ใหม่ต่อท้ายไฟล์ `AI_JOURNAL.md` โดยอัตโนมัติเพื่อยืนยันว่า skill `/journal` ทำงานได้ถูกต้อง
**สิ่งที่เราปรับเอง:** -

## Session 3: ตั้งค่าให้บันทึก Journal อัตโนมัติ
**คำถามที่ถาม AI:** "ทำเลย" (สร้าง CLAUDE.md เพื่อให้ AI บันทึก journal อัตโนมัติทุกการถาม)
**AI ตอบว่า:** สร้างไฟล์ `CLAUDE.md` ที่ root ของโปรเจคพร้อมกติกาให้ AI บันทึก Session ใหม่ลง `AI_JOURNAL.md` หลังตอบทุกครั้ง พร้อมกำหนดข้อยกเว้น
**สิ่งที่เราปรับเอง:** -

## Session 4: ถามวันที่และเวลาในกรุงเทพ
**คำถามที่ถาม AI:** "วันนี้วันอะไรเดือนอะไรปีอะไรเวลาในกรุงเทพกี่โมง"
**AI ตอบว่า:** วันพุธที่ 29 เมษายน 2026 แต่ไม่มีข้อมูลเวลา real-time ให้ดูนาฬิกาเครื่องเอา
**สิ่งที่เราปรับเอง:** -

## Session 5: ถามว่าระบบบันทึกใช้กติกาจากไหน
**คำถามที่ถาม AI:** "คุณเรียกใช้ AI_JOURNAL.md จากไหน — จาก skill หรือจาก CLAUDE.md"
**AI ตอบว่า:** ครั้งล่าสุดทำตามกติกาใน `CLAUDE.md` (โหลดอัตโนมัติทุก session) ไม่ได้เรียก skill อธิบายความต่างระหว่าง CLAUDE.md (อัตโนมัติ) กับ skill `/journal` (ต้องเรียกเอง)
**สิ่งที่เราปรับเอง:** -

## Session 6: ถามว่าระบบบันทึกอัตโนมัติทำให้ช้าลงไหม
**คำถามที่ถาม AI:** "มันจะทำให้ทำงานช้ากว่าเดิมไหม"
**AI ตอบว่า:** ช้าลงนิดหน่อย ราว 2-5 วินาที/คำตอบ จากการเพิ่ม tool call (Read + Edit) และโหลด CLAUDE.md เข้า context พร้อมแนะนำทางเลือกถ้าอยากปิด/กรองเฉพาะคำถามสำคัญ
**สิ่งที่เราปรับเอง:** -

## Session 7: ปิดระบบบันทึกอัตโนมัติ
**คำถามที่ถาม AI:** "1" (เลือกตัวเลือกที่ 1: ปิดอัตโนมัติ)
**AI ตอบว่า:** ลบไฟล์ `CLAUDE.md` ทิ้งเพื่อปิดการบันทึกอัตโนมัติ จากนี้จะบันทึกก็ต่อเมื่อผู้ใช้สั่ง `/journal` เท่านั้น
**สิ่งที่เราปรับเอง:** -

## Session 8: ลบโครงสร้างที่ซ้ำซ้อน
**คำถามที่ถาม AI:** ".claude/commands กับ .claude/skills/journal จำเป็นไหม" แล้วตามด้วย "แก้สิ"
**AI ตอบว่า:** อธิบายว่าทั้งสองทำงานเหมือนกัน แนะนำเก็บ `.claude/skills/journal/` ไว้เพราะเป็นโครงสร้างมาตรฐาน แล้วลบ `.claude/commands/journal.md` พร้อมโฟลเดอร์ commands ที่ว่างทิ้ง
**สิ่งที่เราปรับเอง:** -

## Session 9: เปิดระบบบันทึกอัตโนมัติอีกครั้ง
**คำถามที่ถาม AI:** "เปิดระบบอัตโนมัติสิ"
**AI ตอบว่า:** ตรวจสอบพบว่าไฟล์ `CLAUDE.md` ยังอยู่ (การลบครั้งก่อนไม่สำเร็จหรือถูกสร้างกลับมา) ระบบ auto-journal จึงทำงานอยู่แล้ว
**สิ่งที่เราปรับเอง:** -

## Session 10: ลบ Session ทั้งหมดให้เหลือ 1
**คำถามที่ถาม AI:** "ลบ AI_JOURNAL.md ให้เหลือ 1 ได้ไหม"
**AI ตอบว่า:** เขียนทับไฟล์ใหม่โดยเหลือเฉพาะ Session 1
**สิ่งที่เราปรับเอง:** สั่งย้อนกลับทันทีหลังจากนั้น

## Session 11: ย้อนกลับการลบ Session
**คำถามที่ถาม AI:** "ย้อนกลับได้"
**AI ตอบว่า:** กู้คืนเนื้อหา Session 2-9 จากประวัติการสนทนา และเพิ่ม Session 10 (การลบ) กับ 11 (การย้อนกลับ) เป็นบันทึกเหตุการณ์
**สิ่งที่เราปรับเอง:** -

## Session 12: ขออธิบาย Skills
**คำถามที่ถาม AI:** "คุณรู้จัก skills ไม่ อธิบายมาหน่อย"
**AI ตอบว่า:** อธิบายว่า skill คือชุดคำสั่งเฉพาะทางที่ AI เรียกใช้เมื่อเจองานตรงกับ description พร้อมโครงสร้างไฟล์ (SKILL.md + frontmatter), ที่อยู่ 3 ระดับ (personal/project/plugin), วิธีเรียกใช้, ตัวอย่าง skill ในเครื่อง และความต่างจาก CLAUDE.md
**สิ่งที่เราปรับเอง:** -

## Session 13: เพิ่มเป้าหมายโปรเจคลง CLAUDE.md
**คำถามที่ถาม AI:** ผู้ใช้แชร์ spec โปรเจค (web app: Login/Chat/Upload/Token Usage), Tech Stack (Next.js/Nuxt.js + DB อะไรก็ได้ + Docker Compose), Required Features 30 คะแนน, Bonus 20 คะแนน, Code Quality 15 คะแนน
**AI ตอบว่า:** เพิ่มข้อมูลทั้งหมดลง `CLAUDE.md` แบ่งเป็นหัวข้อ เป้าหมายโปรเจค / Tech Stack / Required Features / Bonus Features / Code Quality พร้อมคงส่วน AI Journal เดิมไว้
**สิ่งที่เราปรับเอง:** -

## Session 14: ระบุ Tech Stack และขอบเขตงานชัดเจน
**คำถามที่ถาม AI:** ผู้ใช้ระบุ stack ที่จะใช้: Next.js (frontend), Express.js (backend), MongoDB, Claude API หรือ Gemini, JWT + bcrypt, Docker Compose พร้อมยืนยันต้องทำ Required Features ครบ และเลือกทำ Bonus 20 คะแนน
**AI ตอบว่า:** อัปเดต `CLAUDE.md` หัวข้อ Tech Stack ให้ระบุชัดเจน (ไม่ใช่ทางเลือก) และเพิ่มหัวข้อ "ขอบเขตงาน" ระบุว่า Required ทำครบทุกข้อ Bonus เป้าหมาย 20 คะแนน
**สิ่งที่เราปรับเอง:** -

## Session 15: แนะนำ skill จาก GitHub repo ที่เหมาะกับโปรเจค
**คำถามที่ถาม AI:** "ช่วยดู skill ใน github นี้หน่อย https://github.com/alirezarezvani/claude-skills.git ว่าอันไหนเหมาะกับโปรเจคนี้"
**AI ตอบว่า:** ดึงข้อมูล repo มาวิเคราะห์ แนะนำ skill 4 ตัวหลัก (rag-architect, database-designer, api-design-reviewer, api-test-suite-builder) + 4 ตัวเสริม (pr-review-expert, dependency-auditor, observability-designer, ci-cd-pipeline-builder) พร้อมเสนอลำดับการใช้งาน
**สิ่งที่เราปรับเอง:** -

## Session 16: ติดตั้ง skills จาก GitHub ลงโปรเจค
**คำถามที่ถาม AI:** "ติดตั้งให้หน่อยสิเอาไปใส่ในโฟลเดอร์ skills ด้วยนะ"
**AI ตอบว่า:** clone repo ไปที่ `/tmp/claude-skills` แล้ว copy ทั้ง 8 skills จาก `engineering/` ไปยัง `.claude/skills/` ของโปรเจค Claude Code โหลดอัตโนมัติพร้อมใช้งาน
**สิ่งที่เราปรับเอง:** -

## Session 17: ถามเรื่องโฟลเดอร์ .codex
**คำถามที่ถาม AI:** "แล้วตัวที่ชื่อว่า .codex ละ"
**AI ตอบว่า:** อธิบายว่า `.codex/` เป็น packaging สำหรับ OpenAI Codex ไม่ใช่ Claude Code — เป็นแค่ index/symlink ชี้กลับไปยังไฟล์ skill จริงใน domain folder (engineering, marketing, ฯลฯ) เราใช้ Claude Code จึง copy จาก `engineering/` ถูกต้องแล้ว ไม่ต้องติดตั้ง `.codex/`
**สิ่งที่เราปรับเอง:** -

## Session 18: ขอรายชื่อ skills ที่ติดตั้ง
**คำถามที่ถาม AI:** "มี skills อะไรบ้างที่ติดตั้ง"
**AI ตอบว่า:** ลิสต์ 9 skills รวม journal (ของผู้ใช้) + 8 ตัวจาก GitHub (rag-architect, database-designer, api-design-reviewer, api-test-suite-builder, pr-review-expert, dependency-auditor, observability-designer, ci-cd-pipeline-builder) พร้อมคำอธิบายสั้นๆ ของแต่ละตัว
**สิ่งที่เราปรับเอง:** -

## Session 19: ทดสอบระบบบันทึก AI Journal
**คำถามที่ถาม AI:** "ทดสอบระบบ AI_JOURNAL.md ว่าทำงานไหม"
**AI ตอบว่า:** เพิ่ม Session 19 ต่อท้ายไฟล์ผ่านกติกาใน CLAUDE.md เพื่อยืนยันว่าระบบบันทึกอัตโนมัติยังทำงานปกติ
**สิ่งที่เราปรับเอง:** -

## Session 20: ติดตั้ง .github/ (CI/CD, PR template, issue template)
**คำถามที่ถาม AI:** "ติดตั้งCI/CD ติดไปเลย"
**AI ตอบว่า:** สร้างโฟลเดอร์ `.github/` ที่ root พร้อม `workflows/ci.yml` (CI สำหรับ frontend Next.js + backend Express + docker compose), `pull_request_template.md` ภาษาไทยพร้อม checklist และ `ISSUE_TEMPLATE/` (bug_report.md, feature_request.md) ทำงานอัตโนมัติเมื่อ push หรือเปิด PR/Issue บน GitHub
**สิ่งที่เราปรับเอง:** -

## Session 21: สร้างหน้า Login ตามดีไซน์ Nexus AI
**คำถามที่ถาม AI:** "ให้สร้างหน้าล็อคอินตามรูปที่ฉันได้ออกแบบไว้" (แนบรูป mockup Nexus AI)
**AI ตอบว่า:** สร้าง `frontend/src/app/login/page.tsx` ด้วย Next.js 16 + Tailwind v4 ตามดีไซน์ Nexus AI ครบทุกส่วน — โลโก้ node-graph, การ์ดสีขาว shadow, แท็บ LOGIN/SIGNUP, ฟิลด์ email/password พร้อม icon, ลิงก์ Forgot, checkbox Remember, ปุ่ม Sign In ม่วง, ตัวคั่น OR CONTINUE WITH, ปุ่ม Google/GitHub, badge PROTECTED ROUTES ENABLED, footer ISO/IEC 27001 พร้อม mock auth admin/admin123 redirect ไป /chat
**สิ่งที่เราปรับเอง:** เปลี่ยน icons inline SVG เป็น `lucide-react` (Lock, Mail, Shield, MessageCircle, Eye, EyeOff), rebrand จาก "Nexus AI" เป็น "Chat Ai", แปลข้อความทั้งหมดเป็นภาษาไทย (ยินดีต้อนรับ / ลงชื่อเข้าใช้ / สมัครสมาชิก / อีเมล / รหัสผ่าน / จำรหัสผ่าน / ลืมรหัสผ่าน), เพิ่มปุ่ม show/hide password (toggle Eye/EyeOff), เพิ่ม useEffect ให้ error message หายเองหลัง 3 วินาที, ย้ายลิงก์ "ลืมรหัสผ่าน?" ให้อยู่ติดกับ checkbox จำรหัสผ่าน, ลบ badge PROTECTED ROUTES ENABLED + ข้อความ SSL/SOC2 ออก, ใช้ `next/link` แทน `<a>` ในลิงก์ภายใน และ สร้าง `src/hooks/useAuth.ts` (login set cookie auth_token / logout clear), สร้าง `src/app/chat/page.tsx` เป็น Server Component ที่อ่าน cookie ผ่าน `next/headers` แล้ว `redirect("/login")` ถ้าไม่มี, สร้าง `src/app/chat/LogoutButton.tsx` (client component), แก้ `login/page.tsx` ลบ mock check ซ้ำซ้อน เหลือแค่เรียก `login()`

## Session 22: สร้างโครงสร้าง folder ตามรูปที่ผู้ใช้ส่ง
**คำถามที่ถาม AI:** "ให้ทำตามโครงสร้างที่ส่งให้หน่อยสร้างขึ้นมาก่อนเลย" (รูปแสดง src/ โครง Vite-style: @types, api, assets, components, hooks, pages, routes, templates, themes, utils, validators) และ ให้แก้โครงสร้างให้เข้ากับ next.js
**AI ตอบว่า:** สร้างโฟลเดอร์ทั้ง 11 ตัวใน `frontend/src/` (เก็บ `app/` ของ Next.js ไว้คู่กัน) พร้อมใส่ `.gitkeep` ในทุกโฟลเดอร์ที่ว่างเพื่อให้ Git track ได้ ไม่สร้างไฟล์ที่ขัดกับ Next.js เช่น `app.tsx`, `main.tsx`, `index.html`, `vite-env.d.ts`และ ลบโฟลเดอร์ที่ขัดกับ Next.js (`pages/`, `routes/`, `templates/`), เปลี่ยนชื่อ `@types/` → `types/`, `themes/` → `styles/`, `utils/` → `lib/` ให้ตรง community convention ของ Next.js เหลือโครงสุดท้าย: `app/`, `api/`, `assets/`, `components/`, `hooks/`, `lib/`, `styles/`, `types/`, `validators/`
**สิ่งที่เราปรับเอง:** -

## Session 23: สร้างหน้า /chat ตามดีไซน์ AI Assistant
**คำถามที่ถาม AI:** "สร้างหน้า chat โดยยึดโครงสร้างเป็นหลัก และเอามาประกอบกันให้ได้หน้า /chat" (แนบรูป mockup AI Assistant — sidebar ซ้าย + welcome + 3 cards + input bar + status)
**AI ตอบว่า:** แตกเป็น components ตามโครง — `types/chat.ts` (types), `lib/mockChat.ts` (data จำลอง), `components/chat/Sidebar.tsx` (logo + ปุ่มแชทใหม่ + history + profile + logout), `components/chat/SuggestionCard.tsx` (การ์ดแนะนำ มี icon 3 แบบ: document/code/lightbulb), `components/chat/MessageInput.tsx` (ช่อง chat + attach/mic/send), `components/chat/StatusBar.tsx` (SYSTEM OPTIMAL + token counter), แล้วประกอบใน `app/chat/page.tsx` ที่ยังเป็น Server Component ตรวจ cookie auth_token ก่อน — ลบ LogoutButton.tsx เดิมเพราะรวมเข้า Sidebar แล้ว ใช้ lucide-react icons ทุกตัว
**สิ่งที่เราปรับเอง:** -

## Session 24: เชื่อม MongoDB ใน backend ให้รันได้จริง
**คำถามที่ถาม AI:** "ให้ทำ 1-4 เลยรัน" โดยหมายถึงติดตั้ง `mongoose` กับ `dotenv`, เขียน `src/app.js` ให้เชื่อม Mongo ตอนสตาร์ต, เพิ่ม script ใน `package.json` และทดสอบให้ว่าเชื่อมได้จริง
**AI ตอบว่า:** ติดตั้ง `mongoose`, `dotenv` และ `nodemon`, ปรับ `backend/package.json` ให้มี `type: module` พร้อม script `start` และ `dev`, เขียน `backend/src/app.js` ให้โหลด `.env` เรียก `connectMongo()` ก่อนเปิด server, เพิ่ม route พื้นฐานใน `backend/src/routes/index.js` และทดสอบจนยืนยันได้ว่า Mongo เชื่อมสำเร็จพร้อมเรียก `http://127.0.0.1:4000/health` ได้ผล `{\"ok\":true}`
**สิ่งที่เราปรับเอง:** -

## Session 25: ทำ Upload File (PDF, TXT) พร้อม validate และ sanitize path
**คำถามที่ถาม AI:** "ทำฟังค์ Upload File (PDF, TXT) ครบ + validate type/size + sanitize path โดยใช้ปุ่มแนบไฟล์ของ MessageInput.tsx"
**AI ตอบว่า:** เพิ่ม `POST /api/uploads` ใน backend ด้วย `multer` สำหรับรับไฟล์ PDF/TXT, ตรวจชนิดไฟล์และจำกัดขนาดไม่เกิน 5 MB, sanitize ชื่อไฟล์และบังคับเส้นทางจัดเก็บให้อยู่ในโฟลเดอร์ `backend/uploads`, บันทึก metadata ลง MongoDB, เสิร์ฟไฟล์ผ่าน `/uploads` และเชื่อมปุ่ม `Paperclip` ใน `frontend/src/components/chat/MessageInput.tsx` ให้เปิด file picker, อัปโหลดจริง, แสดง error/success และรายการไฟล์ที่อัปโหลดล่าสุด
**สิ่งที่เราปรับเอง:** ย้ายรายการไฟล์เข้าไปอยู่ภายในกล่องข้อความด้านบนแถวพิมพ์, แสดงเป็นการ์ดแนวนอนแบบเลื่อนได้, ทำ `preview TXT` เป็นการ์ดชื่อไฟล์กับจำนวนบรรทัด และ `preview PDF` ผ่าน iframe พร้อมป้ายประเภทไฟล์และปุ่มลบในแต่ละการ์ด และ เพิ่ม pending skeleton card ระหว่างอัปโหลดไฟล์, ยกเลิกการจำกัดจำนวนไฟล์ที่เคยตัดไฟล์เก่าทิ้ง, คงรายการไฟล์ทั้งหมดไว้ในแถวเลื่อนแนวนอน และย้ายข้อความแนะนำพร้อมป้ายเตือนไปไว้เหนือกล่องข้อความ ย้ายข้อความ Upload PDF or TXT files up to 5 MB. กับป้ายเตือน Please choose a PDF or TXT file.และ ตั้งเวลาป้ายเตือนให้หายไปเอง

## Session 26: ทำ Chat with AI พร้อม Streaming
**คำถามที่ถาม AI:** อ่าน `CLAUDE.md` กับ `.claude` และทำต่อใน Required Feature `Chat with AI (basic)` ให้ครบ error handling + timeout พร้อม Bonus `Streaming response` และบันทึก `AI_JOURNAL.md`
**AI ตอบว่า:** เพิ่มระบบ chat streaming จริง โดยมี backend endpoint `POST /api/chat/stream`, service สำหรับ Gemini/Claude พร้อม mock fallback, timeout, validation และหน้า chat ฝั่ง frontend ที่อ่าน stream ทีละ chunk แล้วแสดงคำตอบสดและภาษาไทยได้ 
**สิ่งที่เราปรับเอง:** ไม่บันทึกค่า API key จริงลง journal และ เพิ่มกติกาไม่ใส่ emoji ถ้าไม่จำเป็นและไม่แต่งข้อมูลเอง
