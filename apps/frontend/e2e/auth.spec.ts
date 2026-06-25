import { test, expect } from '@playwright/test';

test.describe('Autenticação', () => {
  test('redireciona / para /login quando não autenticado', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/login/);
  });

  test('exibe erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'naoexiste@email.com');
    await page.fill('input[type="password"]', 'senhaerrada123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=E-mail ou senha incorretos')).toBeVisible({ timeout: 5000 });
  });

  test('valida campos obrigatórios antes de submeter', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=E-mail inválido')).toBeVisible();
    await expect(page.locator('text=Mínimo 8 caracteres')).toBeVisible();
  });

  test('login com credenciais válidas redireciona para dashboard', async ({ page }) => {
    // Requer seed: SEED_EMAIL / SEED_PASSWORD no .env.test
    const email = process.env.SEED_EMAIL ?? 'admin@ats.local';
    const password = process.env.SEED_PASSWORD ?? 'Admin@12345';

    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/, { timeout: 8000 });
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });
});
