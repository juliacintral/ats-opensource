import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Entrevistas', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, process.env.SEED_EMAIL ?? 'admin@ats.local', process.env.SEED_PASSWORD ?? 'Admin@12345');
  });

  test('página de entrevistas carrega', async ({ page }) => {
    await page.goto('/interviews');
    await expect(page.locator('h1:has-text("Entrevistas")')).toBeVisible();
  });

  test('formulário de nova entrevista valida campos', async ({ page }) => {
    await page.goto('/interviews/new');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Título obrigatório')).toBeVisible();
  });
});
