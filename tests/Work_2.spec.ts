import { test, expect, BrowserContext, Page } from '@playwright/test';

/**
 * Work 2 : Bottom-Up Integration Testing + DRIVER
 * ผู้จัดทำ : นายวีรวุฒิ นิติทอนกุล 6804101386
 *
 * โมดูลบน (A) Login       -> ไม่ใช้ แทนด้วย DRIVER (ใส่ session cookie ตรง ๆ)
 * โมดูลล่าง (B) Inventory -> ของจริง
 *          (E) Add to Cart -> ของจริง
 *          (F) Cart        -> ของจริง
 *
 * DRIVER Cart  -> เปิดหน้า cart.html ตรง ๆ (ไม่ต้องกดไอคอนตะกร้า)
 *
 * แนวคิด: ทดสอบจากล่างขึ้นบน โมดูลล่างเสร็จก่อน
 * จึงเขียน DRIVER มาเรียกใช้แทนโมดูลบนที่ยังไม่ได้ต่อเข้ามา
 */

// ---------- DRIVER A : แทน Login ----------
async function loginDriver(context: BrowserContext, username = 'standard_user'): Promise<Page> {
  await context.addCookies([
    { name: 'session-username', value: username, url: 'https://www.saucedemo.com' },
  ]);
  const page = await context.newPage();
  await page.goto('/inventory.html');
  await expect(page.locator('[data-test="title"]')).toHaveText('Products');
  return page;
}

// ---------- DRIVER : เปิดหน้า Cart ----------
async function cartDriver(page: Page) {
  await page.goto('/cart.html');
  await expect(page.locator('[data-test="title"]')).toHaveText('Your Cart');
}

test('Bottom-Up DRIVER: Driver A -> B Inventory -> E Add Cart -> F Cart', async ({ browser }) => {
  const context = await browser.newContext({ baseURL: 'https://www.saucedemo.com' });
  try {
    // DRIVER A -> (B) Inventory จริง
    const page = await loginDriver(context);
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(6);

    // (E) Add to Cart 2 ชิ้น
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-fleece-jacket"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('2');

    // (F) Cart - เรียกผ่าน DRIVER
    await cartDriver(page);

    const names = page.locator('[data-test="inventory-item-name"]');
    await expect(names).toHaveCount(2);
    await expect(names).toContainText(['Sauce Labs Bike Light', 'Sauce Labs Fleece Jacket']);
  } finally {
    await context.close();
  }
});
