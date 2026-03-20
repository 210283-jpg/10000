import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StorageService } from '../../src/services/StorageService.js';

// jsdom provides localStorage globally in test environment
describe('StorageService', () => {
  let service;

  beforeEach(() => {
    service = new StorageService();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ---- saveProgress / loadProgress ----

  describe('saveProgress / loadProgress', () => {
    it('saves and loads progress correctly', () => {
      const progress = {
        version: 1,
        timestamp: Date.now(),
        modelId: 'house-01',
        gridWidth: 8,
        gridHeight: 8,
        placedParts: [{ id: 'wall_1', type: 'wall', x: 0, y: 0, rotation: 0 }],
        score: 0,
        elapsedMs: 5000
      };
      service.saveProgress('house-01', progress);
      const loaded = service.loadProgress('house-01');
      expect(loaded).not.toBeNull();
      expect(loaded.modelId).toBe('house-01');
      expect(loaded.placedParts).toHaveLength(1);
    });

    it('returns null when no progress is stored', () => {
      expect(service.loadProgress('nonexistent')).toBeNull();
    });

    it('returns null for corrupt JSON', () => {
      localStorage.setItem('game_progress_house-01', 'NOT_JSON{{{');
      expect(service.loadProgress('house-01')).toBeNull();
    });

    it('returns null for version mismatch', () => {
      const data = { version: 99, modelId: 'house-01', placedParts: [] };
      localStorage.setItem('game_progress_house-01', JSON.stringify(data));
      expect(service.loadProgress('house-01')).toBeNull();
    });

    it('stores JSON at the expected key', () => {
      service.saveProgress('car-01', { version: 1, modelId: 'car-01', placedParts: [] });
      expect(localStorage.getItem('game_progress_car-01')).not.toBeNull();
    });
  });

  // ---- clearProgress ----

  describe('clearProgress', () => {
    it('removes the stored progress', () => {
      service.saveProgress('house-01', { version: 1, modelId: 'house-01', placedParts: [] });
      service.clearProgress('house-01');
      expect(service.loadProgress('house-01')).toBeNull();
    });

    it('does not throw when clearing non-existent key', () => {
      expect(() => service.clearProgress('ghost-model')).not.toThrow();
    });
  });

  // ---- saveScoreRecord / loadScoreRecord ----

  describe('saveScoreRecord / loadScoreRecord', () => {
    const record = {
      modelId: 'robot-01',
      bestScore: 850,
      bestTimeMs: 90000,
      completionCount: 2,
      lastCompletedAt: Date.now()
    };

    it('saves and loads score record', () => {
      service.saveScoreRecord(record);
      const loaded = service.loadScoreRecord('robot-01');
      expect(loaded).not.toBeNull();
      expect(loaded.bestScore).toBe(850);
      expect(loaded.completionCount).toBe(2);
    });

    it('stores at key game_scores_<modelId>', () => {
      service.saveScoreRecord(record);
      expect(localStorage.getItem('game_scores_robot-01')).not.toBeNull();
    });

    it('returns null when no record found', () => {
      expect(service.loadScoreRecord('nonexistent')).toBeNull();
    });
  });

  // ---- loadAllScoreRecords ----

  describe('loadAllScoreRecords', () => {
    it('returns empty array when no scores stored', () => {
      expect(service.loadAllScoreRecords()).toEqual([]);
    });

    it('returns all stored score records', () => {
      service.saveScoreRecord({ modelId: 'house-01', bestScore: 700, completionCount: 1, bestTimeMs: 60000, lastCompletedAt: null });
      service.saveScoreRecord({ modelId: 'car-01',   bestScore: 800, completionCount: 2, bestTimeMs: 50000, lastCompletedAt: null });
      const records = service.loadAllScoreRecords();
      expect(records).toHaveLength(2);
      const ids = records.map(r => r.modelId);
      expect(ids).toContain('house-01');
      expect(ids).toContain('car-01');
    });

    it('ignores non-score keys', () => {
      localStorage.setItem('some_other_key', '{}');
      service.saveScoreRecord({ modelId: 'house-01', bestScore: 100, completionCount: 1, bestTimeMs: 1000, lastCompletedAt: null });
      expect(service.loadAllScoreRecords()).toHaveLength(1);
    });
  });
});
