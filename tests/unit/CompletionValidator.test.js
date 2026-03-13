import { describe, it, expect } from 'vitest';
import { CompletionValidator } from '../../src/engine/CompletionValidator.js';
import { Grid } from '../../src/engine/Grid.js';

const blueprint = {
  id: 'house-01',
  gridWidth: 4,
  gridHeight: 4,
  requiredParts: {
    wall: { quantity: 2, validPositions: 'any' },
    roof: { quantity: 1, validPositions: 'any' },
  },
};

describe('CompletionValidator', () => {
  it('isPlacementValid returns false for out-of-bounds', () => {
    const grid = new Grid(4, 4);
    const validator = new CompletionValidator();
    expect(validator.isPlacementValid('wall', -1, 0, grid, blueprint)).toBe(false);
    expect(validator.isPlacementValid('wall', 0, 4, grid, blueprint)).toBe(false);
  });

  it('isPlacementValid returns false for occupied cell', () => {
    const grid = new Grid(4, 4);
    grid.setCell(0, 0, 'p1', 'wall');
    const validator = new CompletionValidator();
    expect(validator.isPlacementValid('wall', 0, 0, grid, blueprint)).toBe(false);
  });

  it('isPlacementValid returns false when validPositions excludes (x,y)', () => {
    const blueprintConstrained = {
      id: 'test',
      gridWidth: 4,
      gridHeight: 4,
      requiredParts: {
        special: { quantity: 1, validPositions: [{ x: 1, y: 1, allowedRotations: [0] }] },
      },
    };
    const grid = new Grid(4, 4);
    const validator = new CompletionValidator();
    expect(validator.isPlacementValid('special', 0, 0, grid, blueprintConstrained)).toBe(false);
    expect(validator.isPlacementValid('special', 1, 1, grid, blueprintConstrained)).toBe(true);
  });

  it('isPlacementValid returns true for valid placement', () => {
    const grid = new Grid(4, 4);
    const validator = new CompletionValidator();
    expect(validator.isPlacementValid('wall', 0, 0, grid, blueprint)).toBe(true);
  });

  it('isComplete returns false when not all required parts placed', () => {
    const grid = new Grid(4, 4);
    grid.setCell(0, 0, 'p1', 'wall');
    const validator = new CompletionValidator();
    expect(validator.isComplete(grid, blueprint)).toBe(false);
  });

  it('isComplete returns true when all required quantities met', () => {
    const grid = new Grid(4, 4);
    grid.setCell(0, 0, 'p1', 'wall');
    grid.setCell(1, 0, 'p2', 'wall');
    grid.setCell(2, 0, 'p3', 'roof');
    const validator = new CompletionValidator();
    expect(validator.isComplete(grid, blueprint)).toBe(true);
  });
});
