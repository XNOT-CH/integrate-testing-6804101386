# Integration Testing with Playwright — saucedemo.com

**ผู้จัดทำ:** Werawut 6804101386

| งาน | แนวทาง | สิ่งที่ใช้ของจริง | สิ่งที่จำลอง |
|---|---|---|---|
| `tests/Work_1.spec.ts` | Top-Down | (A) Login | **STUB** แทน (B) Inventory |
| `tests/Work_2.spec.ts` | Bottom-Up | (B) Inventory → (E) Add to Cart → (F) Cart | **DRIVER** แทน (A) Login (ใส่ cookie `session-username`) |

## วิธีรัน

```bash
npm install
npx playwright install chromium
npm test              # รันทั้งหมด (headless)
npm run test:headed   # เปิดเบราว์เซอร์ให้เห็น
npm run report        # ดูรายงาน HTML
```
