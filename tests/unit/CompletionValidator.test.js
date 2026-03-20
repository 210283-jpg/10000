import { describe, it, expect, beforeEach } from 'vitest';
import { CompletionValidator } from '../../src/engine/CompletionValidator.js';
import { Grid } from '../../src/engine/Grid.js';

const blueprint = {
  id: 'house-01',
  gridWidth: 8,
  gridHeight: 8,
  requiredParts: { wall: 2, roof: 1 },
  cells: [
    { x: 0, y: 0, partType: 'wall' },
    { x: 1, y: 0, partType: 'wall' },
    { x: 2, y: 0, partType: 'roof' }
  ]
};

describe('CompletionValidator', () => {
  let validator;
  let grid;

  beforeEach(() => {
    validator = new CompletionValidator();
    grid = new Grid(8, 8);
  });

  describe('isPlacementValid', () => {
    it('returns true for a valid placement at a blueprint cell', () => {
      expect(validator.isPlacementValid(grid, 0, 0, 'wall', blueprint)).toBe(true);
    });

    it('returns false when cell is already occupied', () => {
      grid.setCell(0, 0, { occupied: true, partType: 'wall', partId: 'w1' });
      expect(validator.isPlacementValid(grid, 0, 0, 'wall', blueprint)).toBe(false);
    });

    it('returns false for out-of-bounds x', () => {
      expect(validator.isPlacementValid(grid, 100, 0, 'wall', blueprint)).toBe(false);
    });

    it('returns false for out-of-bounds y', () => {
      expect(validator.isPlacementValid(grid, 0, 100, 'wall', blueprint)).toBe(false);
    });

    it('returns false for negative coordinates', () => {
      expect(validator.isPlacementValid(grid, -1, 0, 'wall', blueprint)).toBe(false);
    });

    it('returns false for a position not in blueprint cells', () => {
      expect(validator.isPlacementValid(grid, 7, 7, 'wall', blueprint)).toBe(false);
    });

    it('returns false when partType does not match blueprint cell', () => {
      // Position (2,0) is 'roof' in blueprint, not 'wall'
      expect(validator.isPlacementValid(grid, 2, 0, 'wall', blueprint)).toBe(false);
    });

    it('returns true when partType matches blueprint cell exactly', () => {
      expect(validator.isPlacementValid(grid, 2, 0, 'roof', blueprint)).toBe(true);
    });
  });

  describe('isComplete', () => {
    it('returns false when no parts are placed', () => {
      expect(validator.isComplete(grid, blueprint)).toBe(false);
    });

    it('returns false when only some required parts are placed', () => {
      grid.setCell(0, 0, { occupied: true, partType: 'wall' });
      expect(validator.isComplete(grid, blueprint)).toBe(false);
    });

    it('returns true when all required parts are placed', () => {
      grid.setCell(0, 0, { occupied: true, partType: 'wall' });
      grid.setCell(1, 0, { occupied: true, partType: 'wall' });
      grid.setCell(2, 0, { occupied: true, partType: 'roof' });
      expect(validator.isComplete(grid, blueprint)).toBe(true);
    });

    it('returns false if one required part type is missing', () => {
      grid.setCell(0, 0, { occupied: true, partType: 'wall' });
      grid.setCell(1, 0, { occupied: true, partType: 'wall' });
      // roof is missing
      expect(validator.isComplete(grid, blueprint)).toBe(false);
    });

    it('returns true with more parts than minimum (extra cells filled)', () => {
      grid.setCell(0, 0, { occupied: true, partType: 'wall' });
      grid.setCell(1, 0, { occupied: true, partType: 'wall' });
      grid.setCell(2, 0, { occupied: true, partType: 'roof' });
      // Extra non-required data – should still be complete
      expect(validator.isComplete(grid, blueprint)).toBe(true);
    });
  });
});
