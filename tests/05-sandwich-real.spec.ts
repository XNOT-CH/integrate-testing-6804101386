import { test, expect, Page } from '@playwright/test';

/**
 * 05 : Sandwich REAL
 * ผู้จัดทำ : Werawut 6804101386
 *
 * แบ่งเป็น 2 ทาง แล้วมาบรรจบกันที่ชั้นกลาง (B Inventory)
 *   ทางบน (Top-Down)      : A -> B
 *   ทางล่าง (Bottom-Up)   : B -> E -> F
 * ใช้โมดูลจริงทั้งหมด
 */
async function login(page: Page) {
  await page.goto('/');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
}

test('Sandwich REAL: Top branch (A -> B) + Bottom branch (B -> E -> F)', async ({ page }) => {
  await test.step('Top branch: A Login -> B Inventory', async () => {
    await login(page);
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(6);
  });

  await test.step('Bottom branch: B Inventory -> E Add Cart -> F Cart', async () => {
    await page.locator('[data-test="add-to-cart-sauce-labs-fleece-jacket"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    await page.locator('[data-test="shopping-cart-link"]').click();

    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.locator('[data-test="cart-list"] [data-test="inventory-item-name"]')).toHaveText('Sauce Labs Fleece Jacket');
  });
});
