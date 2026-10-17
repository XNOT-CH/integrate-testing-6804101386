import { test, expect } from '@playwright/test';
import { STUDENT_INFO } from './helpers/student';

/**
 * 02 : Top-Down + STUB
 * ผู้จัดทำ : นายวีรวุฒิ นิติทอนกุล 6804101386
 *
 * A Login ใช้ของจริง ส่วน B Inventory ยังไม่ต่อ -> แทนด้วย STUB
 * saucedemo เป็น SPA (หน้า inventory วาดด้วย JS ไม่มี request ให้ดัก)
 * จึงใช้ page.setContent() แทนเนื้อหาหน้า B หลัง Login สำเร็จ
 */
test('Top-Down STUB: A Login REAL -> B Inventory STUB', async ({ page }) => {
  // A Login (REAL)
  await page.goto('/');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await expect(page).toHaveURL(/inventory\.html/);

  // B Inventory (STUB)
  await page.setContent(`
    <h1 data-test="stub-title">Inventory STUB</h1>
    <ul data-test="stub-list">
      <li>Stub Item A</li>
      <li>Stub Item B</li>
    </ul>
    <footer data-test="student-info">${STUDENT_INFO}</footer>
  `);

  // ตรวจว่า A ส่งต่อมาที่ STUB B ได้
  await expect(page.locator('[data-test="stub-title"]')).toHaveText('Inventory STUB');
  await expect(page.locator('[data-test="stub-list"] li')).toHaveCount(2);
  await expect(page.locator('[data-test="student-info"]')).toHaveText(STUDENT_INFO);
});
