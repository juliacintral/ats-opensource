import { Page } from '@playwright/test';

export async function loginAs(page: Page, email: string, password: string) {
  // Se já estiver autenticado (token no localStorage), pula
  await page.goto('/login');
  const currentUrl = page.url();
  if (!currentUrl.includes('login')) return;

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/, { timeout: 8000 });
}
