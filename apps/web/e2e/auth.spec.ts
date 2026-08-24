import { test, expect } from '@playwright/test';

test('auth pages are light and clean', async ({ page }) => {
  await page.goto('/auth/login', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: /Sign in/i })).toBeVisible();
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe('rgb(248, 250, 252)'); // light slate, never dark
  // No dev/demo jargon visible
  await expect(page.getByText(/Password123!/i)).toHaveCount(0);
  await expect(page.getByText(/IndexedDB/i)).toHaveCount(0);
  await expect(page.getByText(/POST \//i)).toHaveCount(0);
  await page.screenshot({ path: 'e2e/auth-login.png', fullPage: true });
});

test('register page validates and has role selector', async ({ page }) => {
  await page.goto('/auth/register', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: /Create your account/i })).toBeVisible();
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page.getByText(/Fill in your name/i)).toBeVisible();
  await page.screenshot({ path: 'e2e/auth-register.png', fullPage: true });
});

test('wrong password shows friendly error', async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByLabel('Email').fill('thoko@smartkasi.test');
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText(/Wrong email or password/i)).toBeVisible({ timeout: 10000 });
});
