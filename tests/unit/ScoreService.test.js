import { describe, it, expect } from 'vitest';
import { ScoreService } from '../../src/services/ScoreService.js';

describe('ScoreService', () => {
  it('calculates score based on elapsed time — faster = higher', () => {
    const fast = ScoreService.calculateScore(60000, 10);   // 1 min, 10 parts
    const slow = ScoreService.calculateScore(600000, 10);  // 10 min, 10 parts
    expect(fast).toBeGreaterThan(slow);
  });

  it('score is a non-negative integer', () => {
    const score = ScoreService.calculateScore(120000, 9);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(score)).toBe(true);
  });

  it('updateRecord creates new record if none exists', () => {
    const updated = ScoreService.updateRecord(null, 500, 120000);
    expect(updated.bestScore).toBe(500);
    expect(updated.bestTimeMs).toBe(120000);
    expect(updated.completionCount).toBe(1);
  });

  it('updateRecord updates bestScore when new score is higher', () => {
    const existing = { modelId: 'house-01', bestScore: 300, bestTimeMs: 200000, completionCount: 1, lastCompletedAt: 0 };
    const updated = ScoreService.updateRecord(existing, 500, 120000);
    expect(updated.bestScore).toBe(500);
    expect(updated.bestTimeMs).toBe(120000);
    expect(updated.completionCount).toBe(2);
  });

  it('updateRecord keeps bestScore when new score is lower', () => {
    const existing = { modelId: 'house-01', bestScore: 800, bestTimeMs: 60000, completionCount: 2, lastCompletedAt: 0 };
    const updated = ScoreService.updateRecord(existing, 300, 200000);
    expect(updated.bestScore).toBe(800);
    expect(updated.completionCount).toBe(3);
  });
});
