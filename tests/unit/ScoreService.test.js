import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScoreService } from '../../src/services/ScoreService.js';

const mockStorage = {
  saveScoreRecord: vi.fn(),
  loadScoreRecord: vi.fn(),
};

describe('ScoreService', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage.loadScoreRecord.mockReturnValue(null);
    service = new ScoreService(mockStorage);
  });

  it('calculateScore returns higher score for lower time', () => {
    const fast = service.calculateScore(30000, 10);
    const slow = service.calculateScore(120000, 10);
    expect(fast).toBeGreaterThan(slow);
  });

  it('calculateScore returns non-negative score', () => {
    expect(service.calculateScore(999999, 10)).toBeGreaterThanOrEqual(0);
  });

  it('updateRecord saves new ScoreRecord if first time', () => {
    service.updateRecord('house-01', 500, 60000);
    expect(mockStorage.saveScoreRecord).toHaveBeenCalledOnce();
    const saved = mockStorage.saveScoreRecord.mock.calls[0][0];
    expect(saved.modelId).toBe('house-01');
    expect(saved.bestScore).toBe(500);
    expect(saved.completionCount).toBe(1);
  });

  it('updateRecord updates best score when new score is higher', () => {
    mockStorage.loadScoreRecord.mockReturnValue({
      modelId: 'house-01', bestScore: 300, bestTimeMs: 90000, completionCount: 1, lastCompletedAt: 1000,
    });
    service.updateRecord('house-01', 600, 60000);
    const saved = mockStorage.saveScoreRecord.mock.calls[0][0];
    expect(saved.bestScore).toBe(600);
    expect(saved.completionCount).toBe(2);
  });

  it('loadRecord delegates to storageService', () => {
    const record = { modelId: 'car-01', bestScore: 200 };
    mockStorage.loadScoreRecord.mockReturnValue(record);
    expect(service.loadRecord('car-01')).toBe(record);
  });
});
