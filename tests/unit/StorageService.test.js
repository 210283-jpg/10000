import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../../src/services/StorageService.js';

describe('StorageService', () => {
  let service;

  beforeEach(() => {
    localStorage.clear();
    service = new StorageService();
  });

  it('saveProgress stores JSON at game_progress_<modelId>', () => {
    const progress = { version: 1, timestamp: 1000, modelId: 'house-01', gridWidth: 8, gridHeight: 8, placedParts: [], score: 0, elapsedMs: 0, achievements: [] };
    service.saveProgress(progress);
    expect(localStorage.getItem('game_progress_house-01')).toBeTruthy();
  });

  it('loadProgress returns parsed BuildProgress', () => {
    const progress = { version: 1, timestamp: 1000, modelId: 'house-01', gridWidth: 8, gridHeight: 8, placedParts: [], score: 0, elapsedMs: 500, achievements: [] };
    service.saveProgress(progress);
    const loaded = service.loadProgress('house-01');
    expect(loaded).not.toBeNull();
    expect(loaded.elapsedMs).toBe(500);
  });

  it('loadProgress returns null on missing key', () => {
    expect(service.loadProgress('nonexistent')).toBeNull();
  });

  it('loadProgress returns null on corrupt data', () => {
    localStorage.setItem('game_progress_bad', 'not-json{{{');
    expect(service.loadProgress('bad')).toBeNull();
  });

  it('loadProgress returns null on version mismatch', () => {
    localStorage.setItem('game_progress_old', JSON.stringify({ version: 99, modelId: 'old' }));
    expect(service.loadProgress('old')).toBeNull();
  });

  it('clearProgress removes key', () => {
    const progress = { version: 1, timestamp: 1000, modelId: 'house-01', gridWidth: 8, gridHeight: 8, placedParts: [], score: 0, elapsedMs: 0, achievements: [] };
    service.saveProgress(progress);
    service.clearProgress('house-01');
    expect(localStorage.getItem('game_progress_house-01')).toBeNull();
  });

  it('saveScoreRecord and loadScoreRecord round-trip', () => {
    const record = { modelId: 'house-01', bestScore: 100, bestTimeMs: 60000, completionCount: 1, lastCompletedAt: 1000 };
    service.saveScoreRecord(record);
    const loaded = service.loadScoreRecord('house-01');
    expect(loaded).not.toBeNull();
    expect(loaded.bestScore).toBe(100);
  });

  it('loadScoreRecord returns null on missing key', () => {
    expect(service.loadScoreRecord('nonexistent')).toBeNull();
  });

  it('loadAllScoreRecords returns array of all stored records', () => {
    service.saveScoreRecord({ modelId: 'house-01', bestScore: 100, bestTimeMs: 60000, completionCount: 1, lastCompletedAt: 1000 });
    service.saveScoreRecord({ modelId: 'car-01', bestScore: 200, bestTimeMs: 30000, completionCount: 2, lastCompletedAt: 2000 });
    const all = service.loadAllScoreRecords();
    expect(all).toHaveLength(2);
  });
});
