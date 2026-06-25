import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import path from 'path';

test.describe('Candidatos', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, process.env.SEED_EMAIL ?? 'admin@ats.local', process.env.SEED_PASSWORD ?? 'Admin@12345');
  });

  test('lista de candidatos carrega', async ({ page }) => {
    await page.goto('/candidates');
    await expect(page.locator('h1:has-text("Candidatos")')).toBeVisible();
  });

  test('cria candidato sem currículo', async ({ page }) => {
    await page.goto('/candidates/new');
    const name = `Candidato E2E ${Date.now()}`;
    await page.fill('input[placeholder*="Ana Silva"]', name);
    await page.fill('input[type="email"]', `e2e${Date.now()}@test.com`);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/candidates\/[a-z0-9-]+$/, { timeout: 8000 });
    await expect(page.locator(`text=${name}`)).toBeVisible();
  });

  test('busca retorna resultado vazio para query inválida', async ({ page }) => {
    await page.goto('/candidates');
    await page.fill('input[placeholder*="Buscar"]', 'xyz_naoexiste_abc_999');
    await expect(page.locator('text=Nenhum candidato encontrado')).toBeVisible({ timeout: 4000 });
  });

  test('detalhe do candidato mostra seções', async ({ page }) => {
    await page.goto('/candidates');
    const first = page.locator('a[href^="/candidates/"]').first();
    if (await first.count() > 0) {
      await first.click();
      await expect(page.locator('text=Ranking de aderência')).toBeVisible();
    }
  });
});
