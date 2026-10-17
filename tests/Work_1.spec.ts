import { test, expect, Page } from '@playwright/test';
import { STUDENT_INFO } from './helpers/student';

/**
 * Work 1 : Top-Down Integration Testing + STUB
 * ผู้จัดทำ : นายวีรวุฒิ นิติทอนกุล 6804101386
 *
 * โมดูลบนสุด (A) Login  -> ใช้ของจริง
 * โมดูลล่าง  (B) Inventory -> ยังไม่ใช้ของจริง แทนด้วย STUB
 *
 * แนวคิด: ทดสอบจากบนลงล่าง เมื่อโมดูลล่างยังไม่พร้อม
 * ให้ใช้ STUB ที่ตอบกลับแบบง่าย ๆ เพื่อเช็คว่า A ส่งต่อไป B ได้ถูกต้อง
 */

// ---------- REAL A : Login ----------
async function loginReal(page: Page, username: string, password: string) {
  await page.goto('/');
  await page.locator('[data-test="username"]').fill(username);
  await page.locator('[data-test="password"]').fill(password);
  await page.locator('[data-test="login-button"]').click();
}

// ---------- STUB B : Inventory ----------
// สินค้าปลอม 2 ชิ้น + ปุ่ม Add to cart ที่นับจำนวนในตะกร้าได้
const STUB_PRODUCTS = [
  { id: 'stub-1', name: 'Stub Product One', price: '$10.00' },
  { id: 'stub-2', name: 'Stub Product Two', price: '$20.00' },
];

async function inventoryStub(page: Page) {
  const items = STUB_PRODUCTS.map(
    (p) => `
      <div class="inventory_item" data-test="${p.id}">
        <div class="inventory_item_name">${p.name}</div>
        <div class="inventory_item_price">${p.price}</div>
        <button data-test="add-${p.id}">Add to cart</button>
      </div>`,
  ).join('');

  await page.setContent(`
    <span class="title">Products (STUB)</span>
    <a class="shopping_cart_link"><span class="shopping_cart_badge"></span></a>
    <div class="inventory_list">${items}</div>
    <footer data-test="student-info">${STUDENT_INFO}</footer>
    <script>
      let count = 0;
      document.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => {
          count++;
          btn.textContent = 'Remove';
          document.querySelector('.shopping_cart_badge').textContent = String(count);
        });
      });
    </script>
  `);
}

test.describe('Work 1 - Top-Down (Login REAL -> Inventory STUB)', () => {
  test('TD-01: Login สำเร็จแล้วส่งต่อไปหน้า Inventory (STUB)', async ({ page }) => {
    await loginReal(page, 'standard_user', 'secret_sauce');

    // A ทำงานจริง -> ต้องพาไปหน้า inventory
    await expect(page).toHaveURL(/inventory\.html/);

    // แทน B ด้วย STUB
    await inventoryStub(page);

    await expect(page.locator('.title')).toHaveText('Products (STUB)');
    await expect(page.locator('.inventory_item')).toHaveCount(STUB_PRODUCTS.length);
    await expect(page.locator('.inventory_item_name').first()).toHaveText('Stub Product One');
    await expect(page.locator('[data-test="student-info"]')).toHaveText(STUDENT_INFO);
  });

  test('TD-02: กด Add to cart บน STUB แล้วตัวเลขตะกร้าเพิ่มขึ้น', async ({ page }) => {
    await loginReal(page, 'standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/inventory\.html/);
    await inventoryStub(page);

    await page.locator('[data-test="add-stub-1"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    await expect(page.locator('[data-test="add-stub-1"]')).toHaveText('Remove');

    await page.locator('[data-test="add-stub-2"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
  });

  test('TD-03: Login ผิด จะไม่ไปถึง Inventory (ไม่ต้องเรียก STUB)', async ({ page }) => {
    await loginReal(page, 'locked_out_user', 'secret_sauce');

    await expect(page).not.toHaveURL(/inventory\.html/);
    await expect(page.locator('[data-test="error"]')).toContainText('locked out');
  });
});
