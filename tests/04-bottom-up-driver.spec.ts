import { test, expect, BrowserContext, Page } from '@playwright/test';

/**
 * 04 : Bottom-Up + DRIVER
 * ผู้จัดทำ : Werawut 6804101386
 *
 * DRIVER A แทนชั้น Login ด้านบน: ไม่กรอกฟอร์ม แต่ใส่ cookie session ให้เลย
 * แล้วเรียกโมดูลล่าง B Inventory -> E Add Cart ซึ่งเป็นของจริง
 */
async function driverA(context: BrowserContext): Promise<Page> {
  await context.addCookies([
    { name: 'session-username', value: 'standard_user', url: 'https://www.saucedemo.com' },
  ]);
  const page = await context.newPage();
  await page.goto('https://www.saucedemo.com/inventory.html');
  return page;
}

test('Bottom-Up DRIVER: Driver A -> B Inventory -> E Add Cart', async ({ browser }) => {
  const context = await browser.newContext();
  try {
    // DRIVER A
    const page = await driverA(context);

    // B Inventory (REAL)
    await expect(page.locator('[data-test="title"]')).toHaveText('Products');

    // E Add to Cart (REAL)
    await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
    await expect(page.locator('[data-test="remove-sauce-labs-bolt-t-shirt"]')).toBeVisible();
  } finally {
    await context.close();
  }
});
