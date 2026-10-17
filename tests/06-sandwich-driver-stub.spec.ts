import { test, expect } from '@playwright/test';
import { STUDENT_INFO } from './helpers/student';

/**
 * 06 : Sandwich + STUB + DRIVER
 * ผู้จัดทำ : Werawut 6804101386
 *
 * ทางบน (Top-Down)    : A Login REAL -> B Inventory STUB
 * ทางล่าง (Bottom-Up) : DRIVER A -> B Inventory REAL -> E Add Cart -> F Cart
 * แต่ละทางใช้ browser context แยกกัน
 */
test('Sandwich: Top-Down STUB + Bottom-Up DRIVER', async ({ browser }) => {
  await test.step('Top branch: A REAL -> B STUB', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto('https://www.saucedemo.com/');
      await page.locator('[data-test="username"]').fill('standard_user');
      await page.locator('[data-test="password"]').fill('secret_sauce');
      await page.locator('[data-test="login-button"]').click();
      await expect(page).toHaveURL(/inventory\.html/);

      await page.setContent(`
        <h1 data-test="stub-title">Inventory STUB (Sandwich)</h1>
        <footer data-test="student-info">${STUDENT_INFO}</footer>
      `);
      await expect(page.locator('[data-test="stub-title"]')).toContainText('STUB');
      await expect(page.locator('[data-test="student-info"]')).toHaveText(STUDENT_INFO);
    } finally {
      await context.close();
    }
  });

  await test.step('Bottom branch: DRIVER A -> B REAL -> E -> F', async () => {
    const context = await browser.newContext();
    try {
      // DRIVER A
      await context.addCookies([
        { name: 'session-username', value: 'standard_user', url: 'https://www.saucedemo.com' },
      ]);
      const page = await context.newPage();
      await page.goto('https://www.saucedemo.com/inventory.html');

      // B -> E
      await page.locator('[data-test="add-to-cart-sauce-labs-onesie"]').click();
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

      // E -> F
      await page.locator('[data-test="shopping-cart-link"]').click();
      await expect(page).toHaveURL(/cart\.html/);
      await expect(page.locator('[data-test="cart-list"] [data-test="inventory-item-name"]')).toHaveText('Sauce Labs Onesie');
    } finally {
      await context.close();
    }
  });
});
