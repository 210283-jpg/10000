import { test, expect } from '@playwright/test';

test.describe('US1: Basic model building', () => {
  test('can select a model and place a part', async ({ page }) => {
    await page.goto('/');

    // Model selection screen is visible
    await expect(page.locator('#screen-model-select')).toBeVisible();

    // Click select on first model card
    await page.locator('.model-card button[data-action="select"]').first().click();

    // Build screen appears
    await expect(page.locator('#screen-build')).toBeVisible();
    await expect(page.locator('#screen-model-select')).not.toBeVisible();

    // Select first part
    await page.locator('.part-item').first().click();
    await expect(page.locator('.part-item.selected')).toBeVisible();

    // Listen for game:partPlaced event via page.evaluate
    let partPlacedFired = false;
    await page.evaluate(() => {
      document.addEventListener('game:partPlaced', () => {
        window._partPlacedFired = true;
      });
    });

    // Click canvas to place part
    const canvas = page.locator('#build-canvas');
    await canvas.click({ position: { x: 10, y: 10 } });

    partPlacedFired = await page.evaluate(() => !!window._partPlacedFired);
    expect(partPlacedFired).toBe(true);
  });
});

test.describe('US2: Progress persistence', () => {
  test('model status shows 進行中 after placing parts and reloading', async ({ page }) => {
    await page.goto('/');
    // Select first model (house-01)
    await page.locator('.model-card button[data-action="select"]').first().click();
    await expect(page.locator('#screen-build')).toBeVisible();

    // Select and place 3 parts
    for (let i = 0; i < 3; i++) {
      const partItems = page.locator('.part-item:not(.depleted)');
      await partItems.first().click();
      const canvas = page.locator('#build-canvas');
      await canvas.click({ position: { x: (i + 1) * 50, y: 50 } });
    }

    // Reload page
    await page.reload();
    await expect(page.locator('#screen-model-select')).toBeVisible();

    // The first model card should show 進行中
    const statusBadge = page.locator('.model-card').first().locator('.model-status');
    await expect(statusBadge).toHaveText('進行中');
  });
});
