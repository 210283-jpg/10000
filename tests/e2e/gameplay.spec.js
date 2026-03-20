import { test, expect } from '@playwright/test';

test.describe('US1 – Basic model building', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows model selection screen on load', async ({ page }) => {
    await expect(page.locator('#screen-model-select')).toBeVisible();
    await expect(page.locator('#screen-build')).toBeHidden();
  });

  test('shows at least 3 model cards', async ({ page }) => {
    const cards = page.locator('.model-card');
    await expect(cards).toHaveCount(3);
  });

  test('clicking select button shows build screen', async ({ page }) => {
    await page.locator('.model-card button[data-action="select"]').first().click();
    await expect(page.locator('#screen-build')).toBeVisible();
    await expect(page.locator('#screen-model-select')).toBeHidden();
  });

  test('parts panel is rendered with part items', async ({ page }) => {
    await page.locator('.model-card button[data-action="select"]').first().click();
    const partItems = page.locator('.part-item');
    await expect(partItems.first()).toBeVisible();
  });

  test('clicking a part item selects it (adds .selected class)', async ({ page }) => {
    await page.locator('.model-card button[data-action="select"]').first().click();
    const firstPart = page.locator('.part-item').first();
    await firstPart.click();
    await expect(firstPart).toHaveClass(/selected/);
  });

  test('game:partPlaced event fires when placing on valid cell', async ({ page }) => {
    // Select the house model
    await page.locator('[data-model-id="house-01"] button[data-action="select"]').click();

    // Listen for the event
    const partPlacedPromise = page.evaluate(() =>
      new Promise(resolve => {
        document.addEventListener('game:partPlaced', (e) => resolve(e.detail), { once: true });
      })
    );

    // Select first part item
    await page.locator('.part-item').first().click();

    // Click canvas at the first blueprint cell of house-01: floor at (1,7)
    // CELL_SIZE = 48, so x=1*48+24=72, y=7*48+24=360
    const canvas = page.locator('#build-canvas');
    await canvas.click({ position: { x: 72, y: 360 } });

    const detail = await partPlacedPromise;
    expect(detail).toBeDefined();
  });

  test('menu button returns to model selection', async ({ page }) => {
    await page.locator('.model-card button[data-action="select"]').first().click();
    await page.locator('#btn-menu').click();
    await expect(page.locator('#screen-model-select')).toBeVisible();
  });
});

test.describe('US2 – Model selection and progress', () => {
  test('model cards display name and description', async ({ page }) => {
    await page.goto('/');
    const names = await page.locator('.model-name').allTextContents();
    expect(names).toContain('小屋');
    expect(names).toContain('小汽車');
    expect(names).toContain('機器人');
  });
});
