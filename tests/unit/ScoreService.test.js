import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ScoreService } from '../../src/services/ScoreService.js';
import { StorageService } from '../../src/services/StorageService.js';

describe('ScoreService', () => {
  let storageService;
  let service;

  beforeEach(() => {
    localStorage.clear();
    storageService = new StorageService();
    service = new ScoreService(storageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ---- calculateScore ----

  describe('calculateScore', () => {
    it('returns 1000 for 0 ms elapsed and 0 mistakes', () => {
      expect(service.calculateScore(0, 0)).toBe(1000);
    });

    it('returns 999 for 1000 ms elapsed and 0 mistakes', () => {
      expect(service.calculateScore(1000, 0)).toBe(999);
    });

    it('returns 940 for 60000 ms elapsed and 0 mistakes', () => {
      expect(service.calculateScore(60000, 0)).toBe(940);
    });

    it('deducts 10 pts per mistake', () => {
      // 0 ms, 5 mistakes → 1000 - 50 = 950
      expect(service.calculateScore(0, 5)).toBe(950);
    });

    it('deducts both time and mistake penalties', () => {
      // 30000 ms = 30s, 2 mistakes → 1000 - 30 - 20 = 950
      expect(service.calculateScore(30000, 2)).toBe(950);
    });

    it('floors elapsed seconds (not rounds)', () => {
      // 1999 ms → 1 second penalty → 999
      expect(service.calculateScore(1999, 0)).toBe(999);
    });

    it('never returns below 0', () => {
      expect(service.calculateScore(2000000, 100)).toBe(0);
    });

    it('defaults mistakes to 0 when not provided', () => {
      expect(service.calculateScore(0)).toBe(1000);
    });
  });

  // ---- updateRecord ----

  describe('updateRecord', () => {
    it('creates new record when none exists', () => {
      const record = service.updateRecord('house-01', 850);
      expect(record.modelId).toBe('house-01');
      expect(record.bestScore).toBe(850);
      expect(record.completionCount).toBe(1);
    });

    it('updates bestScore if new score is higher', () => {
      service.updateRecord('house-01', 600);
      const record = service.updateRecord('house-01', 900);
      expect(record.bestScore).toBe(900);
    });

    it('keeps existing bestScore if new score is lower', () => {
      service.updateRecord('house-01', 900);
      const record = service.updateRecord('house-01', 500);
      expect(record.bestScore).toBe(900);
    });

    it('increments completionCount each call', () => {
      service.updateRecord('house-01', 700);
      service.updateRecord('house-01', 800);
      const record = service.updateRecord('house-01', 750);
      expect(record.completionCount).toBe(3);
    });

    it('sets lastCompletedAt to a number', () => {
      const record = service.updateRecord('car-01', 500);
      expect(typeof record.lastCompletedAt).toBe('number');
    });

    it('persists record via storageService', () => {
      service.updateRecord('robot-01', 777);
      const stored = storageService.loadScoreRecord('robot-01');
      expect(stored).not.toBeNull();
      expect(stored.bestScore).toBe(777);
    });
  });

  // ---- loadRecord ----

  describe('loadRecord', () => {
    it('returns null when no record exists', () => {
      expect(service.loadRecord('nonexistent')).toBeNull();
    });

    it('returns stored record', () => {
      service.updateRecord('house-01', 900);
      expect(service.loadRecord('house-01')).not.toBeNull();
    });
  });
});
