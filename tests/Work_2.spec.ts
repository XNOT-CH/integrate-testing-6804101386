import { test, expect, Browser, Page } from '@playwright/test';

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

// ---------- DRIVER : แทน Login ----------
async function loginDriver(browser: Browser, username = 'standard_user'): Promise<Page> {
  const context = await browser.newContext({ baseURL: 'https://www.saucedemo.com' });
  await context.addCookies([
    { name: 'session-username', value: username, url: 'https://www.saucedemo.com' },
  ]);
  const page = await context.newPage();
  await page.goto('/inventory.html');
  return page;
}

// ---------- DRIVER : เปิดหน้า Cart ----------
async function cartDriver(page: Page) {
  await page.goto('/cart.html');
  await expect(page.locator('[data-test="title"]')).toHaveText('Your Cart');
}

test.describe('Work 2 - Bottom-Up (DRIVER -> Inventory -> Add Cart -> Cart)', () => {
  test('BU-01: DRIVER เปิดหน้า Inventory ได้โดยไม่ผ่าน Login', async ({ browser }) => {
    const page = await loginDriver(browser);

    await expect(page.locator('[data-test="title"]')).toHaveText('Products');
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(6);

    await page.context().close();
  });

  test('BU-02: Inventory -> Add to Cart -> Cart แสดงสินค้าถูกต้อง', async ({ browser }) => {
    const page = await loginDriver(browser);

    // (E) Add to Cart 2 ชิ้น
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-fleece-jacket"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('2');

    // (F) Cart - เรียกผ่าน DRIVER
    await cartDriver(page);

    const names = page.locator('[data-test="inventory-item-name"]');
    await expect(names).toHaveCount(2);
    await expect(names).toContainText(['Sauce Labs Bike Light', 'Sauce Labs Fleece Jacket']);

    await page.context().close();
  });

  test('BU-03: ลบสินค้าในหน้า Cart แล้วจำนวนลดลง', async ({ browser }) => {
    const page = await loginDriver(browser);

    await page.locator('[data-test="add-to-cart-sauce-labs-onesie"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click();
    await cartDriver(page);

    await page.locator('[data-test="remove-sauce-labs-onesie"]').click();

    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Bolt T-Shirt');

    await page.context().close();
  });

  test('BU-04: ไม่มี DRIVER (ไม่มี session) เข้าหน้า Inventory ไม่ได้', async ({ page }) => {
    await page.goto('/inventory.html');

    await expect(page).not.toHaveURL(/inventory\.html/);
    await expect(page.locator('[data-test="error"]')).toContainText('only access');
  });
});
