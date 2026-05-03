# ผลการรัน Unit Tests

> วันที่รัน: 2026-05-03 · Node.js v22.16.0 · Platform: win32
> ดูคำอธิบายของแต่ละเทสที่ [TESTS.md](./TESTS.md)

---

## สรุปภาพรวม

| | Backend | Frontend | **รวม** |
|---|---|---|---|
| จำนวนไฟล์ | 7 | 5 | **12** |
| จำนวนเทส | 33 | 28 | **61** |
| ผ่าน | 33 | 28 | **61** ✅ |
| ไม่ผ่าน | 0 | 0 | **0** |
| ข้าม | 0 | 0 | **0** |

**สถานะ: ผ่านครบทุกเทส (61/61)**

---

## ผลค่า Coverage

| ตัวชี้วัด | ผลที่ได้ | เกณฑ์ขั้นต่ำ | สถานะ |
|---|---|---|---|
| **Statements** (คำสั่ง) | **60.93%** | ≥ 40% | ✅ |
| **Branches** (สาขาเงื่อนไข) | **80.70%** | ≥ 40% | ✅ |
| **Functions** (ฟังก์ชัน) | **74.52%** | ≥ 40% | ✅ |
| **Lines** (บรรทัด) | **60.93%** | ≥ 40% | ✅ |

### Coverage รายไฟล์

```
-------------------------|---------|----------|---------|---------|
ไฟล์                      | % Stmts | % Branch | % Funcs | % Lines |
-------------------------|---------|----------|---------|---------|
ทั้งหมด                    |   60.93 |    80.70 |   74.52 |   60.93 |
 backend/src/middlewares |   64.25 |    82.05 |   46.15 |   64.25 |
  auth.js                |   81.25 |    83.33 |  100.00 |   81.25 |
  rateLimit.js           |   97.67 |    82.75 |  100.00 |   97.67 |
  upload.js              |   40.60 |    75.00 |   12.50 |   40.60 |
 backend/src/services    |   48.31 |    74.72 |   54.54 |   48.31 |
  aiClient.js            |   35.21 |    85.00 |   35.29 |   35.21 |
  authService.js         |   46.00 |    73.68 |   50.00 |   46.00 |
  documentContext.js     |   67.32 |    72.09 |   73.33 |   67.32 |
  uploadCleanup.js       |   54.02 |    66.66 |   66.66 |   54.02 |
 frontend/src/api        |   99.31 |    85.71 |  100.00 |   99.31 |
  auth.ts                |  100.00 |    91.30 |  100.00 |  100.00 |
  chat.ts                |   97.50 |    83.33 |  100.00 |   97.50 |
  conversations.ts       |  100.00 |    88.00 |  100.00 |  100.00 |
  upload.ts              |  100.00 |    80.76 |  100.00 |  100.00 |
-------------------------|---------|----------|---------|---------|
```

> รายงาน HTML ฉบับเต็มอยู่ที่ `tests/coverage/index.html` (ถูกสร้างเมื่อรัน `npm run coverage`)

---

## รายละเอียดผลรัน

### Backend (`npm run test:backend`) — 33/33 ผ่าน

```
▶ aiClient — exports
  ✔ export ค่า CHAT_TIMEOUT_MS เป็นตัวเลขบวก
✔ aiClient — exports

▶ streamAiChat — เส้นทาง mock provider (ไม่มี API key)
  ✔ ส่งคำตอบ demo ออกมาเป็นหลาย chunk
  ✔ abort ระหว่างสตรีมเมื่อ signal ถูก abort
  ✔ ใช้ข้อความ default เมื่อไม่พบ user message
✔ streamAiChat — เส้นทาง mock provider

▶ middleware requireAuth
  ✔ ตอบ 401 เมื่อไม่มี session userId
  ✔ ตอบ 401 เมื่อ session.userId ว่าง
  ✔ ส่ง error ที่ User.findById โยนต่อให้ next()
✔ middleware requireAuth

▶ authService — validation ของ registerUser
  ✔ reject เมื่ออีเมลว่าง
  ✔ reject เมื่ออีเมลไม่มี "@"
  ✔ reject เมื่อรหัสผ่านสั้นกว่า 8 ตัว
  ✔ ถือว่าอีเมล null เป็น invalid
✔ authService — validation ของ registerUser

▶ authService — findPublicUserById
  ✔ คืน null เมื่อไม่มี userId
✔ authService — findPublicUserById

▶ extractDocumentPages
  ✔ อ่านไฟล์ .txt ได้ 1 page พร้อมเนื้อหา
  ✔ คืน array ว่างเมื่อนามสกุลไม่รองรับ
✔ extractDocumentPages

▶ buildDocumentIndex
  ✔ สร้าง preview/length/chunk index ที่ถูกต้องสำหรับไฟล์ .txt
  ✔ ไฟล์ใหญ่จะแบ่งหลาย chunk โดย index เพิ่มต่อเนื่อง
  ✔ ทำเครื่องหมาย extractionStatus เป็น empty เมื่อไม่มีเนื้อหาให้แบ่ง
✔ buildDocumentIndex

▶ getRelevantDocumentContext
  ✔ คืน context ว่างเมื่อไม่มีเอกสารเลย
  ✔ สลับเป็น whole-document เมื่อ query ขอสรุป
  ✔ fallback ใช้ client metadata เมื่อ stored docs หาย
  ✔ ละเลย client document ที่ไม่มี id
✔ getRelevantDocumentContext

▶ createRateLimit
  ✔ ปล่อย request ที่ยังไม่เกิน limit และตั้ง headers ครบ
  ✔ บล็อก 429 พร้อม Retry-After เมื่อเกิน limit
  ✔ แยก bucket ระหว่าง user กับ IP
  ✔ ใช้ค่า default เมื่อ option ไม่ถูกต้อง
  ✔ ฟอร์แมตเวลา Retry-After ทั้งหน่วยวินาทีและนาที
  ✔ ใช้ key ว่างได้เมื่อไม่มี user/IP
✔ createRateLimit

▶ uploadCleanup module exports
  ✔ export startUploadCleanupJob เป็นฟังก์ชัน
  ✔ เรียก startUploadCleanupJob ได้โดยไม่ throw (timer ใช้ unref)
✔ uploadCleanup module exports

▶ upload middleware module
  ✔ export MAX_FILE_SIZE เท่ากับ 5 MB
  ✔ export เป็น Express middleware ที่รับ 3 อาร์กิวเมนต์
  ✔ สร้างโฟลเดอร์ uploads/ ใน cwd ตอน import (sandbox path)
  ✔ จัดการ request ที่ไม่มีไฟล์ได้ (multer error path)
✔ upload middleware module

ℹ tests 33
ℹ pass 33
ℹ fail 0
ℹ duration_ms ~11577
```

> หมายเหตุ: เทส `uploadCleanup` มี warning จาก mongoose timeout (เพราะเทสไม่ได้ต่อ DB จริง — `startUploadCleanupJob` พยายาม query แล้ว buffer หมดเวลา) ไม่ทำให้เทสล้ม เป็นเพียง log นอกขอบเขตการ assert

### Frontend (`npm run test:frontend`) — 28/28 ผ่าน

```
▶ frontend auth API client
  ✔ loginUser คืน user เมื่อ response สำเร็จ
  ✔ loginUser throw โดยใช้ message จาก server
  ✔ loginUser fallback ไป default message เมื่อ payload หาย
  ✔ registerUser ตั้ง name จาก local-part ของอีเมล
  ✔ getCurrentUser คืน user จาก response 200
  ✔ logoutUser ส่ง POST ไปที่ /auth/logout
✔ frontend auth API client

▶ frontend streamChat
  ✔ อ่าน chunk ผ่าน onChunk และส่ง payload ที่ถูกต้อง
  ✔ throw ใช้ message จาก server เมื่อ response ไม่ ok
  ✔ เพิ่ม retry hint ภาษาไทยเมื่อ 429 พร้อม retryAfter
  ✔ ใช้ formatter หน่วยวินาทีเมื่อ retryAfter < 60
  ✔ throw เมื่อ response body หาย
✔ frontend streamChat

▶ frontend conversations API client
  ✔ listConversations คืน array จาก response
  ✔ createConversation ส่ง payload และคืน conversation ที่สร้าง
  ✔ updateConversation ใช้ PATCH พร้อม id ใน path
  ✔ deleteConversation ใช้ DELETE และ resolve เมื่อสำเร็จ
  ✔ throw ใช้ message จาก server เมื่อล้มเหลว
  ✔ fallback ไป default message เมื่อ parse JSON พัง
✔ frontend conversations API client

▶ frontend uploadDocument
  ✔ reject นามสกุลที่ไม่รองรับก่อนเรียก HTTP
  ✔ คืน payload ที่ parse แล้วเมื่อสำเร็จ
  ✔ throw ใช้ message จาก server เมื่อ response ไม่ ok
✔ frontend uploadDocument

▶ frontend deleteDocument
  ✔ ส่ง DELETE ไปที่ id ที่ตรง
  ✔ throw เมื่อ response ไม่ ok พร้อม message จาก server
✔ frontend deleteDocument

▶ frontend upload validators
  ✔ export ค่าคงที่ครบ
  ✔ รับไฟล์ .pdf ขนาดเล็ก
  ✔ รับไฟล์ .txt ไม่สนตัวพิมพ์
  ✔ reject ไฟล์ .docx พร้อมข้อความชัดเจน
  ✔ reject ไฟล์ที่ไม่มีนามสกุล
  ✔ reject ไฟล์ใหญ่กว่า 5 MB
✔ frontend upload validators

ℹ tests 28
ℹ pass 28
ℹ fail 0
ℹ duration_ms ~1385
```

---

## ส่วนที่ยังครอบคลุมไม่ครบ

ไฟล์ที่ยังเทสไม่ครบเพราะต้องใช้ DB จริงหรือบริการภายนอก:

- **`backend/src/services/aiClient.js`** — เส้นทางที่เรียก Gemini/Claude API จริง (บรรทัด 225-298, 302-386) เทสได้แค่ mock fallback
- **`backend/src/services/authService.js`** — `registerUser` หลัง validate, `authenticateUser`, `ensureDefaultAdmin` ต้อง mock User model
- **`backend/src/services/uploadCleanup.js`** — ฟังก์ชันหลัก `cleanupExpiredUploads` ต้อง mock Upload + fs
- **`backend/src/middlewares/upload.js`** — `decodeOriginalName`, `sanitizeFileStem`, `createSafeFilename`, `fileFilter` ต้องทำ integration test ผ่าน supertest จริง
- **Controllers** (`authController`, `chatController`, `uploadController`, `conversationController`) — ตอนนี้ยังไม่มีเทส (ต้อง integration test)

หมายเหตุ: ทั้งหมดผ่านเกณฑ์ ≥ 40% ครบแล้ว ถ้าจะดัน coverage ต่อ แนะนำใช้ `supertest` คู่กับ `mongodb-memory-server` ทำ integration test

---

## คำสั่งที่ใช้

```bash
cd tests
npm test           # รัน 61 เทส
npm run coverage   # รันพร้อม coverage report
```
