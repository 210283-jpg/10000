import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StorageService } from '../../src/services/StorageService.js';

describe('StorageService', () => {
  let storage;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('saveProgress stores JSON at game_progress_<modelId>', () => {
    const progress = {
      version: 1, timestamp: Date.now(), modelId: 'house-01',
      gridWidth: 8, gridHeight: 8, placedParts: [], score: 0, elapsedMs: 0, achievements: [],
    };
    storage.saveProgress(progress);
    const raw = localStorage.getItem('game_progress_house-01');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw).modelId).toBe('house-01');
  });

  it('loadProgress returns parsed BuildProgress', () => {
    const progress = {
      version: 1, timestamp: Date.now(), modelId: 'house-01',
      gridWidth: 8, gridHeight: 8, placedParts: [], score: 0, elapsedMs: 0, achievements: [],
    };
    storage.saveProgress(progress);
    const loaded = storage.loadProgress('house-01');
    expect(loaded).not.toBeNull();
    expect(loaded.modelId).toBe('house-01');
  });

  it('loadProgress returns null if no save exists', () => {
    expect(storage.loadProgress('missing-model')).toBeNull();
  });

  it('loadProgress returns null on corrupt data', () => {
    localStorage.setItem('game_progress_bad', 'not-json{{{');
    expect(storage.loadProgress('bad')).toBeNull();
  });

  it('loadProgress returns null on version mismatch', () => {
    const progress = {
      version: 99, timestamp: Date.now(), modelId: 'house-01',
      gridWidth: 8, gridHeight: 8, placedParts: [], score: 0, elapsedMs: 0, achievements: [],
    };
    localStorage.setItem('game_progress_house-01', JSON.stringify(progress));
    expect(storage.loadProgress('house-01')).toBeNull();
  });

  it('clearProgress removes key', () => {
    const progress = {
      version: 1, timestamp: Date.now(), modelId: 'house-01',
      gridWidth: 8, gridHeight: 8, placedParts: [], score: 0, elapsedMs: 0, achievements: [],
    };
    storage.saveProgress(progress);
    storage.clearProgress('house-01');
    expect(localStorage.getItem('game_progress_house-01')).toBeNull();
  });

  it('saveScoreRecord / loadScoreRecord round-trip', () => {
    const record = { modelId: 'house-01', bestScore: 100, bestTimeMs: 60000, completionCount: 1, lastCompletedAt: Date.now() };
    storage.saveScoreRecord(record);
    const loaded = storage.loadScoreRecord('house-01');
    expect(loaded).not.toBeNull();
    expect(loaded.bestScore).toBe(100);
  });

  it('loadScoreRecord returns null if not stored', () => {
    expect(storage.loadScoreRecord('missing-model')).toBeNull();
  });

  it('loadAllScoreRecords returns array of all stored records', () => {
    storage.saveScoreRecord({ modelId: 'house-01', bestScore: 100, bestTimeMs: 60000, completionCount: 1, lastCompletedAt: Date.now() });
    storage.saveScoreRecord({ modelId: 'car-01', bestScore: 80, bestTimeMs: 90000, completionCount: 1, lastCompletedAt: Date.now() });
    const all = storage.loadAllScoreRecords();
    expect(all).toHaveLength(2);
  });
});
