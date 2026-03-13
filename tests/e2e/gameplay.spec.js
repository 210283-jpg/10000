import { test, expect } from '@playwright/test';

test.describe('US1 - Basic model building', () => {
  test('can select a model and see build screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#screen-model-select')).toBeVisible();
    
    const firstSelectBtn = page.locator('.model-card button[data-action="select"]').first();
    await firstSelectBtn.click();
    
    await expect(page.locator('#screen-build')).toBeVisible();
    await expect(page.locator('#screen-model-select')).not.toBeVisible();
  });

  test('can select a part and place it on the canvas', async ({ page }) => {
    await page.goto('/');
    
    await page.locator('.model-card button[data-action="select"]').first().click();
    await expect(page.locator('#screen-build')).toBeVisible();

    const partItem = page.locator('.part-item').first();
    await partItem.click();
    await expect(page.locator('.part-item.selected')).toBeVisible();

    // Listen for the game:partPlaced event
    const eventPromise = page.evaluate(() => {
      return new Promise((resolve) => {
        document.addEventListener('game:partPlaced', (e) => resolve(e.detail), { once: true });
      });
    });

    const canvas = page.locator('#build-canvas');
    await canvas.click({ position: { x: 50, y: 50 } });

    const eventDetail = await eventPromise;
    expect(eventDetail).toBeTruthy();
    expect(eventDetail.partType).toBeTruthy();
  });
});

test.describe('US2 - Progress persistence', () => {
  test('progress is restored after page reload', async ({ page }) => {
    await page.goto('/');
    
    // Select first model
    await page.locator('.model-card button[data-action="select"]').first().click();
    await expect(page.locator('#screen-build')).toBeVisible();
    
    // Place a part
    await page.locator('.part-item').first().click();
    const canvas = page.locator('#build-canvas');
    await canvas.click({ position: { x: 50, y: 50 } });
    
    // Reload and check model selection shows progress
    await page.reload();
    await expect(page.locator('#screen-model-select')).toBeVisible();
    
    // The first model card should show "進行中"
    const status = page.locator('.model-card').first().locator('.model-status');
    await expect(status).toHaveText('進行中');
  });
});

test.describe('US3 - Score and achievements', () => {
  test('completing a model shows results screen with score', async ({ page }) => {
    await page.goto('/');
    
    // Select house model (fewest parts: 10 total)
    await page.locator('.model-card[data-model-id="house-01"] button[data-action="select"]').click();
    await expect(page.locator('#screen-build')).toBeVisible();

    // Place all required parts for house-01
    // house-01: wall×4, roof×2, door×1, window×2, floor×1 = 10 parts
    const partsToPlace = [
      ...Array(4).fill('wall'),
      ...Array(2).fill('roof'),
      'door',
      ...Array(2).fill('window'),
      'floor',
    ];

    let cellX = 0;
    let cellY = 0;
    const CELL = 48;

    for (const partType of partsToPlace) {
      // Select the part
      await page.locator(`.part-item[data-part-type="${partType}"]`).click();
      // Place it
      const canvas = page.locator('#build-canvas');
      await canvas.click({ position: { x: cellX * CELL + 24, y: cellY * CELL + 24 } });
      // Move to next cell
      cellX++;
      if (cellX >= 8) { cellX = 0; cellY++; }
    }

    // Should show results screen
    await expect(page.locator('#screen-results')).toBeVisible({ timeout: 5000 });
    
    const scoreText = await page.locator('#results-score').textContent();
    expect(Number(scoreText)).toBeGreaterThan(0);

    // first-build achievement should be unlocked
    await expect(page.locator('.achievement-badge[data-achievement-id="first-build"]')).toHaveClass(/unlocked/);
  });

  test('menu button on results screen returns to model select', async ({ page }) => {
    await page.goto('/');
    
    // Complete the model quickly using game engine directly via page.evaluate
    await page.locator('.model-card[data-model-id="house-01"] button[data-action="select"]').click();
    
    // Manually fire game:modelCompleted
    await page.evaluate(() => {
      document.dispatchEvent(new CustomEvent('game:modelCompleted', {
        detail: { modelId: 'house-01', score: 500, elapsedMs: 60000, unlockedAchievements: ['first-build'] }
      }));
    });
    
    await expect(page.locator('#screen-results')).toBeVisible();
    
    await page.locator('#screen-results button[data-action="menu"]').click();
    await expect(page.locator('#screen-model-select')).toBeVisible();
    await expect(page.locator('.model-card[data-model-id="house-01"] .model-status')).toHaveText('已完成');
  });
});
