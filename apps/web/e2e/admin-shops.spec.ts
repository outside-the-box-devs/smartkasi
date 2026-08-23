import { test, expect } from '@playwright/test';

const SHOP_ID = '7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/auth/login');
  await page.getByLabel('Email').fill('thoko@smartkasi.test');
  await page.getByLabel('Password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL('**/dashboard');
}

test.describe.serial('dashboard', () => {
  test('unauthenticated /dashboard redirects to sign in', async ({ page }) => {
    await page.goto('/dashboard/shops');
    await page.waitForURL('**/auth/login**', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });

  test('light background everywhere', async ({ page }) => {
    await page.goto('/auth/login', { waitUntil: 'networkidle' });
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe('rgb(248, 250, 252)');
  });

  test('login with real Supabase auth reaches dashboard', async ({ page }) => {
    await login(page);
    await expect(page.getByRole('heading', { name: /Welcome/i })).toBeVisible({ timeout: 12000 });
    await expect(page.getByText('thoko@smartkasi.test').first()).toBeVisible();
  });

  test('dashboard shows only the signed-in owner\'s shops', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/shops', { waitUntil: 'networkidle' });
    // Thoko owns exactly one seeded shop.
    await expect(page.getByText("Mama Thoko's Tuckshop")).toBeVisible({ timeout: 12000 });
    // Other owners' shops must not leak into her dashboard.
    await expect(page.getByText('Bra Sipho Spaza')).toHaveCount(0);
    await expect(page.getByText('Kasi Fresh Mini Market')).toHaveCount(0);
    await expect(page.getByText('Verified').first()).toBeVisible();
    // Real seeded low-stock item (Clover Milk 3/6)
    await expect(page.getByText(/running low/i).first()).toBeVisible({ timeout: 12000 });
    await page.screenshot({ path: 'e2e/shops-real.png', fullPage: true });
  });

  test('shop detail tabs work on real data', async ({ page }) => {
    await login(page);
    await page.goto(`/dashboard/shops/${SHOP_ID}`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: /Mama Thoko/i })).toBeVisible();

    await page.getByRole('button', { name: 'Stock', exact: true }).click();
    await expect(page.getByText(/Iwisa Super Maize Meal/).first()).toBeVisible({ timeout: 12000 });

    await page.getByRole('button', { name: 'Licence', exact: true }).click();
    await expect(page.getByText(/licence is verified/i).first()).toBeVisible();

    await page.screenshot({ path: 'e2e/shop-detail-tabs.png', fullPage: true });
  });

  test('POS real barcode lookup adds item with real price', async ({ page }) => {
    await login(page);
    await page.goto(`/dashboard/shops/${SHOP_ID}`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Sell', exact: true }).click();
    await page.getByLabel('Scan or type barcode').fill('6001068000456');
    await page.getByRole('button', { name: 'Add item', exact: true }).click();
    await expect(page.getByText(/Iwisa Super Maize Meal × 1/i)).toBeVisible({ timeout: 12000 });
    await expect(page.getByText('R 85.00').first()).toBeVisible();
  });

  test('sign out returns to login and guard re-arms', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForURL('**/auth/login**');
    await page.goto('/dashboard');
    await page.waitForURL('**/auth/login**', { timeout: 10000 });
  });
});
