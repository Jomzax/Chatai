# Tests

โฟลเดอร์ unit tests แยกออกจาก `backend/` และ `frontend/` ตามที่กำหนด

## โครงสร้าง

```
tests/
├── package.json          # ใช้ Node built-in test runner + c8 (coverage)
├── fixtures/             # ไฟล์ตัวอย่างสำหรับ test
│   └── sample.txt
└── unit/
    ├── rateLimit.test.js          # createRateLimit middleware
    ├── documentContext.test.js    # buildDocumentIndex / extractDocumentPages
    └── uploadMiddleware.test.js   # upload middleware module surface
```

## วิธีรัน

```bash
# ติดตั้ง c8 ครั้งแรก
cd tests
npm install

# รัน tests
npm test

# รัน tests พร้อมเช็ค coverage (threshold ≥ 40%)
npm run coverage
```

## เป้าหมาย Coverage

ตั้ง threshold ใน `package.json`:

- `--lines 40`
- `--functions 40`
- `--branches 40`
- `--statements 40`

ถ้า coverage ต่ำกว่า 40% ใน metric ใด `npm run coverage` จะ exit ด้วย error

## ไฟล์ที่อยู่ในขอบเขต coverage

scope ผ่าน `--include` ใน `package.json` ไปที่ pure-logic modules ของ backend:

- `backend/src/middlewares/rateLimit.js`
- `backend/src/services/documentContext.js`
- `backend/src/middlewares/upload.js`

โมดูลเหล่านี้ทดสอบได้โดยไม่ต้องต่อ MongoDB จริง
