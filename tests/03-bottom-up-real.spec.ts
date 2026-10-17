import { test, expect, Page } from '@playwright/test';

/**
 * 03 : Bottom-Up REAL (ไม่มี Stub / Driver)
 * ผู้จัดทำ : นายวีรวุฒิ นิติทอนกุล 6804101386
 *
 * ทดสอบกลุ่มโมดูลล่าง (B -> E -> F) ก่อน แล้วค่อยต่อ A Login เข้ามาทีหลัง
 * saucedemo เป็น black-box จึงต้อง login จริงเป็นเงื่อนไขก่อนเข้าโมดูลล่าง
 */
async function realLogin(page: Page) {
  await page.goto('/');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
}

test.describe('Bottom-Up REAL', () => {
  test('BU-R1: รวมโมดูลล่าง B Inventory -> E Add Cart -> F Cart', async ({ page }) => {
    await realLogin(page);

    // B
    await expect(page.locator('[data-test="inventory-list"]')).toBeVisible();

    // E
    await page.locator('[data-test="add-to-cart-sauce-labs-onesie"]').click();
    await page.locator('[data-test="add-to-cart-test.allthethings()-t-shirt-(red)"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('2');

    // F
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.locator('[data-test="cart-list"] [data-test="inventory-item"]')).toHaveCount(2);
  });

  test('BU-R2: ต่อ A Login ขึ้นไปบนกลุ่ม B-E-F ที่ทดสอบแล้ว', async ({ page }) => {
    // A
    await realLogin(page);
    await expect(page).toHaveURL(/inventory\.html/);

    // A -> B -> E
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // E -> F
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.locator('[data-test="cart-list"] [data-test="inventory-item-name"]')).toHaveText('Sauce Labs Backpack');
  });
});
