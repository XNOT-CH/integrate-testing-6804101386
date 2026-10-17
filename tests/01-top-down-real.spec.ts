import { test, expect } from '@playwright/test';

/**
 * 01 : Top-Down REAL (ไม่มี Stub / Driver)
 * ผู้จัดทำ : นายวีรวุฒิ นิติทอนกุล 6804101386
 *
 * ต่อโมดูลจากบนลงล่างทีละชั้น ใช้ของจริงทั้งหมด
 *   ชั้น 1 : A Login
 *   ชั้น 2 : B Inventory
 *   ชั้น 3 : E Add to Cart -> F Cart
 */
test('Top-Down REAL: A Login -> B Inventory -> E Add Cart -> F Cart', async ({ page }) => {
  // ชั้น 1 : A Login (REAL)
  await page.goto('/');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();

  // A -> B : ต้องเข้าหน้า Inventory ได้
  await expect(page).toHaveURL(/inventory\.html/);

  // ชั้น 2 : B Inventory (REAL)
  await expect(page.locator('[data-test="title"]')).toHaveText('Products');
  await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(6);

  // ชั้น 3 : E Add to Cart (REAL)
  await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
  await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

  // ชั้น 3 : F Cart (REAL)
  await page.locator('[data-test="shopping-cart-link"]').click();
  await expect(page).toHaveURL(/cart\.html/);
  await expect(page.locator('[data-test="cart-list"] [data-test="inventory-item-name"]')).toHaveText('Sauce Labs Bike Light');
});
