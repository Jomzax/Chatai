# รายการ Unit Tests

ไฟล์นี้อธิบายว่าเทสแต่ละไฟล์ทำอะไรบ้าง รวมทั้งหมด **61 เทส** จาก **12 ไฟล์**

> ดูผลรันล่าสุดที่ [TEST_RESULTS.md](./TEST_RESULTS.md)

---

## โครงสร้างโฟลเดอร์

```
tests/
├── package.json          # node:test + tsx + c8
├── tsconfig.json         # config สำหรับไฟล์ทดสอบที่เป็น TypeScript
├── fixtures/
│   └── sample.txt        # ไฟล์ตัวอย่างที่ documentContext ใช้
└── unit/
    ├── backend/          # 7 ไฟล์ — 33 เทส
    └── frontend/         # 5 ไฟล์ — 28 เทส
```

---

## เทสฝั่ง Backend (33 เทส)

### 1. [unit/backend/rateLimit.test.js](unit/backend/rateLimit.test.js) — 6 เทส
ทดสอบ middleware `createRateLimit` ใน [backend/src/middlewares/rateLimit.js](../backend/src/middlewares/rateLimit.js)

| # | ชื่อเทส | สิ่งที่ตรวจ |
|---|---|---|
| 1 | ปล่อย request ที่ยังไม่เกิน limit และตั้ง headers ครบ | ปล่อย request ผ่าน + ตั้ง `X-RateLimit-*` headers ถูกต้อง |
| 2 | บล็อก 429 พร้อม `Retry-After` เมื่อเกิน limit | ส่งสถานะ 429 และระบุเวลารอ |
| 3 | แยก bucket ระหว่าง user กับ IP | request ของ user-id ไม่นับรวมกับ IP เดียวกัน |
| 4 | ใช้ค่า default เมื่อ option ผิดประเภท | fallback เป็น 20 req/นาที |
| 5 | ฟอร์แมตเวลา Retry-After ทั้งหน่วยวินาทีและนาที | format ทั้ง "seconds" และ "minutes" |
| 6 | ใช้ key ว่างได้เมื่อไม่มี user/IP | ทำงานต่อแม้ request ไม่มี user หรือ IP |

### 2. [unit/backend/documentContext.test.js](unit/backend/documentContext.test.js) — 9 เทส
ทดสอบการอ่าน/index เอกสารใน [backend/src/services/documentContext.js](../backend/src/services/documentContext.js)

**`extractDocumentPages` (2):**
| # | ชื่อเทส | สิ่งที่ตรวจ |
|---|---|---|
| 1 | อ่านไฟล์ `.txt` แล้วได้ 1 page พร้อมเนื้อหา | text ไม่ว่าง, pageNumber = 1 |
| 2 | คืน array ว่างเมื่อไม่ใช่นามสกุลที่รองรับ | `.docx` ไม่ผ่าน |

**`buildDocumentIndex` (3):**
| # | ชื่อเทส | สิ่งที่ตรวจ |
|---|---|---|
| 3 | สร้าง preview/textLength/chunk index ถูกต้องสำหรับไฟล์ `.txt` | ตรวจ field ครบและ chunk แรกฟอร์แมตถูก |
| 4 | ไฟล์ใหญ่จะแบ่งหลาย chunk โดย index เพิ่มต่อเนื่อง | ทดลองกับไฟล์ 80 บรรทัด |
| 5 | ไฟล์ที่มีแต่ whitespace → `extractionStatus: 'empty'` | ไฟล์ว่างไม่ทำให้พัง |

**`getRelevantDocumentContext` (4):**
| # | ชื่อเทส | สิ่งที่ตรวจ |
|---|---|---|
| 6 | คืน context ว่างเมื่อไม่มีเอกสารเลย | `documents: [], context: ''` |
| 7 | สลับเป็น `whole-document` เมื่อ query ขอสรุปทั้งไฟล์ | คำว่า `summarize`/`overview` |
| 8 | fallback ใช้ client metadata เมื่อหา record ไม่เจอ | ส่งข้อมูลไฟล์มาทาง clientDocuments แทน |
| 9 | กรอง client document ที่ไม่มี id ออก | รวมถึง `null`, `undefined` |

### 3. [unit/backend/uploadMiddleware.test.js](unit/backend/uploadMiddleware.test.js) — 4 เทส
ทดสอบ middleware อัปโหลดใน [backend/src/middlewares/upload.js](../backend/src/middlewares/upload.js)

| # | ชื่อเทส | สิ่งที่ตรวจ |
|---|---|---|
| 1 | ค่า `MAX_FILE_SIZE` เท่ากับ 5 MB | ค่าคงที่ขนาดไฟล์สูงสุด |
| 2 | export เป็น Express middleware ที่รับ 3 อาร์กิวเมนต์ | function signature `(req, res, next)` |
| 3 | สร้างโฟลเดอร์ `uploads/` ใน cwd ตอน import | ทดสอบใน sandbox path |
| 4 | จัดการ request ที่ไม่มีไฟล์ได้ | ไม่ throw |

### 4. [unit/backend/aiClient.test.js](unit/backend/aiClient.test.js) — 4 เทส
ทดสอบ AI streaming ใน [backend/src/services/aiClient.js](../backend/src/services/aiClient.js) (ผ่าน mock provider เพราะไม่ได้ตั้ง API key)

| # | ชื่อเทส | สิ่งที่ตรวจ |
|---|---|---|
| 1 | export `CHAT_TIMEOUT_MS` เป็นตัวเลขบวก | ค่า timeout |
| 2 | mock provider ส่งคำตอบเป็นหลาย chunk | คำว่า "Demo AI response" + เนื้อหา user message |
| 3 | abort กลางทางได้ → throw error 504 | abort signal หยุดสตรีม |
| 4 | ใช้ข้อความ default เมื่อไม่มี user message | fallback "your message" |

### 5. [unit/backend/authService.test.js](unit/backend/authService.test.js) — 5 เทส
ทดสอบ validation ใน [backend/src/services/authService.js](../backend/src/services/authService.js)

| # | ชื่อเทส | สิ่งที่ตรวจ |
|---|---|---|
| 1 | reject เมื่ออีเมลว่าง | throw 400 พร้อมข้อความ |
| 2 | reject เมื่ออีเมลไม่มี `@` | format check |
| 3 | reject เมื่อรหัสผ่านสั้นกว่า 8 ตัว | bcrypt ขั้นต่ำ |
| 4 | reject เมื่ออีเมลเป็น `null` | safe coercion |
| 5 | `findPublicUserById` คืน `null` เมื่อไม่มี userId | guard ก่อนเรียก DB |

### 6. [unit/backend/authMiddleware.test.js](unit/backend/authMiddleware.test.js) — 3 เทส
ทดสอบ `requireAuth` ใน [backend/src/middlewares/auth.js](../backend/src/middlewares/auth.js)

| # | ชื่อเทส | สิ่งที่ตรวจ |
|---|---|---|
| 1 | ตอบ 401 เมื่อไม่มี session | ไม่มี session object |
| 2 | ตอบ 401 เมื่อ session.userId ว่าง | userId เป็นค่าว่าง |
| 3 | ส่ง error ที่ throw จาก `User.findById` ต่อให้ `next()` | error forwarding |

### 7. [unit/backend/uploadCleanup.test.js](unit/backend/uploadCleanup.test.js) — 2 เทส
ทดสอบ [backend/src/services/uploadCleanup.js](../backend/src/services/uploadCleanup.js)

| # | ชื่อเทส | สิ่งที่ตรวจ |
|---|---|---|
| 1 | export `startUploadCleanupJob` เป็นฟังก์ชัน | export shape |
| 2 | เรียก `startUploadCleanupJob()` ได้โดยไม่ throw | timer ใช้ `unref` ไม่ block process |

---

## เทสฝั่ง Frontend (28 เทส)

### 8. [unit/frontend/uploadValidator.test.ts](unit/frontend/uploadValidator.test.ts) — 6 เทส
ทดสอบ `validateUploadFile` ใน [frontend/src/api/upload.ts](../frontend/src/api/upload.ts)

| # | ชื่อเทส | สิ่งที่ตรวจ |
|---|---|---|
| 1 | export ค่าคงที่ครบ | `MAX_UPLOAD_SIZE_BYTES`, `ALLOWED_UPLOAD_EXTENSIONS` |
| 2 | รับไฟล์ `.pdf` ขนาดเล็ก | path ปกติ |
| 3 | รับ `.txt` ไม่สนตัวพิมพ์ใหญ่/เล็ก | `NOTES.TXT` ผ่าน |
| 4 | reject ไฟล์ `.docx` พร้อมข้อความชัดเจน | throw "PDF or TXT" |
| 5 | reject ไฟล์ที่ไม่มีนามสกุล | ป้องกัน upload สุ่ม |
| 6 | reject ไฟล์ใหญ่กว่า 5 MB | ขนาดเกิน → throw "too large" |

### 9. [unit/frontend/uploadApi.test.ts](unit/frontend/uploadApi.test.ts) — 5 เทส
ทดสอบ `uploadDocument` + `deleteDocument` (ใช้ `globalThis.fetch` ที่ mock)

| # | ชื่อเทส | สิ่งที่ตรวจ |
|---|---|---|
| 1 | reject นามสกุลที่ไม่รองรับก่อนเรียก fetch | validate ก่อน HTTP |
| 2 | คืน payload ที่ parse แล้วเมื่อ response สำเร็จ | parse JSON |
| 3 | throw ใช้ message จาก server เมื่อ response ไม่สำเร็จ | error mapping |
| 4 | `deleteDocument` ส่ง DELETE ไปที่ `/uploads/:id` | path/method ถูก |
| 5 | throw เมื่อ delete ไม่สำเร็จพร้อม message จาก server | error path |

### 10. [unit/frontend/authApi.test.ts](unit/frontend/authApi.test.ts) — 6 เทส
ทดสอบ auth client ใน [frontend/src/api/auth.ts](../frontend/src/api/auth.ts)

| # | ชื่อเทส | สิ่งที่ตรวจ |
|---|---|---|
| 1 | `loginUser` คืน user เมื่อ response สำเร็จ | parse user |
| 2 | `loginUser` ใช้ message จาก server เมื่อ 401 | "Bad creds" |
| 3 | fallback message default เมื่อ payload เพี้ยน | "Authentication failed" |
| 4 | `registerUser` ตั้ง name จาก local-part ของอีเมล | `jane@example.com` → `jane` |
| 5 | `getCurrentUser` คืน user จาก session 200 | session lookup |
| 6 | `logoutUser` ส่ง POST ไปที่ `/auth/logout` | endpoint + method |

### 11. [unit/frontend/chatApi.test.ts](unit/frontend/chatApi.test.ts) — 5 เทส
ทดสอบ `streamChat` ใน [frontend/src/api/chat.ts](../frontend/src/api/chat.ts)

| # | ชื่อเทส | สิ่งที่ตรวจ |
|---|---|---|
| 1 | อ่าน chunks ผ่าน `onChunk` และส่ง body ครบ | stream + payload |
| 2 | throw ใช้ message จาก server เมื่อ response ไม่ ok | error path |
| 3 | เพิ่มข้อความ retry ภาษาไทยเมื่อ 429 พร้อม `retryAfter` | format "1 นาที 30 วินาที" |
| 4 | ใช้ formatter หน่วยวินาทีเมื่อ retryAfter < 60 | format "30 วินาที" |
| 5 | throw เมื่อ response body หาย | body = null |

### 12. [unit/frontend/conversationsApi.test.ts](unit/frontend/conversationsApi.test.ts) — 6 เทส
ทดสอบ CRUD ของแชทใน [frontend/src/api/conversations.ts](../frontend/src/api/conversations.ts)

| # | ชื่อเทส | สิ่งที่ตรวจ |
|---|---|---|
| 1 | `listConversations` คืน array จาก response | GET list |
| 2 | `createConversation` ส่ง POST + คืนแชทที่สร้าง | POST + return new |
| 3 | `updateConversation` ส่ง PATCH ไปที่ `/conversations/:id` | path + method |
| 4 | `deleteConversation` ส่ง DELETE และ resolve เมื่อสำเร็จ | DELETE method |
| 5 | throw ใช้ message จาก server เมื่อ delete ไม่เจอแชท | "Conversation not found." |
| 6 | fallback message default เมื่อ JSON parse พัง | "Unable to load conversations." |

---

## วิธีรัน

```bash
cd tests
npm install                # ครั้งแรกเท่านั้น
npm run test:backend       # รันเฉพาะ backend
npm run test:frontend      # รันเฉพาะ frontend
npm test                   # รันทั้งสองฝั่ง
npm run coverage           # รันพร้อม coverage report (ตั้ง threshold ≥ 40%)
```

## เครื่องมือที่ใช้

- **Test runner:** `node:test` (Node 22 มาในตัว)
- **Coverage:** [c8](https://www.npmjs.com/package/c8) (V8 coverage)
- **TypeScript loader:** [tsx](https://www.npmjs.com/package/tsx) (สำหรับโหลดไฟล์ `.ts` ของ frontend)
- **การ mock:** override `globalThis.fetch` สำหรับ frontend, เรียกฟังก์ชันบริสุทธิ์โดยตรงสำหรับ backend
