import { describe, it, expect, beforeEach } from 'vitest';
import { Grid } from '../../src/engine/Grid.js';

describe('Grid', () => {
  let grid;

  beforeEach(() => {
    grid = new Grid(8, 8);
  });

  describe('constructor', () => {
    it('initialises with correct width and height', () => {
      expect(grid.width).toBe(8);
      expect(grid.height).toBe(8);
    });

    it('initialises with empty cells', () => {
      expect(Object.keys(grid.cells)).toHaveLength(0);
    });

    it('all cells are initially unoccupied (getCell returns null)', () => {
      for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
          expect(grid.getCell(x, y)).toBeNull();
        }
      }
    });
  });

  describe('isValidPosition', () => {
    it('returns true for (0,0)', () => {
      expect(grid.isValidPosition(0, 0)).toBe(true);
    });

    it('returns true for (7,7) – max valid position', () => {
      expect(grid.isValidPosition(7, 7)).toBe(true);
    });

    it('returns false for negative x', () => {
      expect(grid.isValidPosition(-1, 0)).toBe(false);
    });

    it('returns false for negative y', () => {
      expect(grid.isValidPosition(0, -1)).toBe(false);
    });

    it('returns false for x equal to width', () => {
      expect(grid.isValidPosition(8, 0)).toBe(false);
    });

    it('returns false for y equal to height', () => {
      expect(grid.isValidPosition(0, 8)).toBe(false);
    });

    it('returns false for x > width', () => {
      expect(grid.isValidPosition(100, 0)).toBe(false);
    });

    it('returns false for non-integer coordinates', () => {
      expect(grid.isValidPosition(1.5, 0)).toBe(false);
    });
  });

  describe('setCell', () => {
    it('sets cell data at valid position', () => {
      grid.setCell(2, 3, { occupied: true, partId: 'wall_1', partType: 'wall' });
      const cell = grid.getCell(2, 3);
      expect(cell).not.toBeNull();
      expect(cell.occupied).toBe(true);
      expect(cell.partId).toBe('wall_1');
      expect(cell.partType).toBe('wall');
    });

    it('includes x and y in the stored cell', () => {
      grid.setCell(1, 2, { occupied: true });
      const cell = grid.getCell(1, 2);
      expect(cell.x).toBe(1);
      expect(cell.y).toBe(2);
    });

    it('throws on out-of-bounds position', () => {
      expect(() => grid.setCell(10, 10, {})).toThrow();
    });

    it('throws on negative position', () => {
      expect(() => grid.setCell(-1, 0, {})).toThrow();
    });
  });

  describe('getCell', () => {
    it('returns null for an empty cell', () => {
      expect(grid.getCell(3, 3)).toBeNull();
    });

    it('returns the data after setCell', () => {
      grid.setCell(3, 3, { occupied: true, partType: 'roof' });
      const cell = grid.getCell(3, 3);
      expect(cell.partType).toBe('roof');
    });
  });

  describe('clearCell', () => {
    it('removes data from a cell', () => {
      grid.setCell(4, 4, { occupied: true, partType: 'door' });
      grid.clearCell(4, 4);
      expect(grid.getCell(4, 4)).toBeNull();
    });

    it('does not throw when clearing an empty cell', () => {
      expect(() => grid.clearCell(0, 0)).not.toThrow();
    });
  });

  describe('duplicate placement', () => {
    it('overrides existing cell data (no throw)', () => {
      grid.setCell(1, 1, { occupied: true, partType: 'wall' });
      // Second setCell should not throw – it overwrites
      expect(() => grid.setCell(1, 1, { occupied: true, partType: 'door' })).not.toThrow();
      expect(grid.getCell(1, 1).partType).toBe('door');
    });
  });

  describe('toJSON / fromJSON', () => {
    it('round-trips correctly', () => {
      grid.setCell(0, 0, { occupied: true, partType: 'floor' });
      const json = grid.toJSON();
      const restored = Grid.fromJSON(json);
      expect(restored.width).toBe(8);
      expect(restored.height).toBe(8);
      expect(restored.getCell(0, 0)?.partType).toBe('floor');
      expect(restored.getCell(1, 1)).toBeNull();
    });
  });
});
