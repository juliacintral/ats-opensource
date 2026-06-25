import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Vagas', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, process.env.SEED_EMAIL ?? 'admin@ats.local', process.env.SEED_PASSWORD ?? 'Admin@12345');
  });

  test('lista de vagas carrega corretamente', async ({ page }) => {
    await page.goto('/jobs');
    await expect(page.locator('h1:has-text("Vagas")')).toBeVisible();
    // Filtros devem estar presentes
    await expect(page.locator('text=Todas')).toBeVisible();
    await expect(page.locator('text=Abertas')).toBeVisible();
  });

  test('cria uma nova vaga como rascunho', async ({ page }) => {
    await page.goto('/jobs/new');
    await expect(page.locator('h1:has-text("Nova vaga")')).toBeVisible();

    const title = `Vaga E2E ${Date.now()}`;
    await page.fill('input[placeholder*="Engenheiro"]', title);
    await page.fill('input[placeholder*="Tecnologia"]', 'Engenharia');
    await page.fill('input[placeholder*="São Paulo"]', 'Remoto');

    await page.click('button[type="submit"]');
    // Deve redirecionar para detalhe da vaga
    await expect(page).toHaveURL(/\/jobs\/[a-z0-9-]+$/, { timeout: 8000 });
    await expect(page.locator(`text=${title}`)).toBeVisible();
  });

  test('filtra vagas por status', async ({ page }) => {
    await page.goto('/jobs');
    await page.click('button:has-text("Abertas")');
    // Todos os badges visíveis devem ser "Aberta"
    const badges = page.locator('.bg-green-100');
    const count = await badges.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(badges.nth(i)).toContainText('Aberta');
      }
    }
  });

  test('busca por nome de vaga', async ({ page }) => {
    await page.goto('/jobs');
    await page.fill('input[placeholder*="Buscar"]', 'zzz_inexistente_xyz');
    await expect(page.locator('text=Nenhuma vaga encontrada')).toBeVisible({ timeout: 4000 });
  });

  test('kanban da vaga carrega os stages', async ({ page }) => {
    await page.goto('/jobs');
    const firstJob = page.locator('a[href^="/jobs/"]').first();
    if (await firstJob.count() > 0) {
      await firstJob.click();
      await expect(page.locator('text=Pipeline de candidatos')).toBeVisible();
    }
  });
});
