import { describe, it, expect } from 'vitest';
import { CompletionValidator } from '../../src/engine/CompletionValidator.js';
import { Grid } from '../../src/engine/Grid.js';
import { BLUEPRINTS } from '../../src/data/blueprints.js';

const blueprint = BLUEPRINTS[0]; // house-01: wall×4, roof×2, door×1, window×2, floor×1

describe('CompletionValidator.isPlacementValid', () => {
  it('returns false for out-of-bounds position', () => {
    const grid = new Grid(blueprint.gridWidth, blueprint.gridHeight);
    expect(CompletionValidator.isPlacementValid('wall', 99, 0, grid, blueprint)).toBe(false);
    expect(CompletionValidator.isPlacementValid('wall', 0, 99, grid, blueprint)).toBe(false);
  });

  it('returns false for occupied cell', () => {
    const grid = new Grid(blueprint.gridWidth, blueprint.gridHeight);
    grid.setCell(0, 0, 'p1', 'wall');
    expect(CompletionValidator.isPlacementValid('wall', 0, 0, grid, blueprint)).toBe(false);
  });

  it('returns true for valid placement on any-position blueprint', () => {
    const grid = new Grid(blueprint.gridWidth, blueprint.gridHeight);
    expect(CompletionValidator.isPlacementValid('wall', 0, 0, grid, blueprint)).toBe(true);
  });

  it('returns false for constrained positions when (x,y) not in list', () => {
    const constrainedBlueprint = {
      ...blueprint,
      requiredParts: {
        wall: { quantity: 1, validPositions: [{ x: 2, y: 2, allowedRotations: [0] }] },
      },
    };
    const grid = new Grid(blueprint.gridWidth, blueprint.gridHeight);
    expect(CompletionValidator.isPlacementValid('wall', 0, 0, grid, constrainedBlueprint)).toBe(false);
    expect(CompletionValidator.isPlacementValid('wall', 2, 2, grid, constrainedBlueprint)).toBe(true);
  });
});

describe('CompletionValidator.isComplete', () => {
  it('returns false when not all required parts placed', () => {
    const grid = new Grid(blueprint.gridWidth, blueprint.gridHeight);
    const placedParts = [{ id: 'p1', type: 'wall', x: 0, y: 0, rotation: 0 }];
    expect(CompletionValidator.isComplete(placedParts, blueprint)).toBe(false);
  });

  it('returns true when all required quantities are met', () => {
    const grid = new Grid(blueprint.gridWidth, blueprint.gridHeight);
    // house-01: wall×4, roof×2, door×1, window×2, floor×1 = 10 total
    const placedParts = [
      { id: 'w1', type: 'wall', x: 0, y: 0, rotation: 0 },
      { id: 'w2', type: 'wall', x: 1, y: 0, rotation: 0 },
      { id: 'w3', type: 'wall', x: 2, y: 0, rotation: 0 },
      { id: 'w4', type: 'wall', x: 3, y: 0, rotation: 0 },
      { id: 'r1', type: 'roof', x: 0, y: 1, rotation: 0 },
      { id: 'r2', type: 'roof', x: 1, y: 1, rotation: 0 },
      { id: 'd1', type: 'door', x: 0, y: 2, rotation: 0 },
      { id: 'wi1', type: 'window', x: 1, y: 2, rotation: 0 },
      { id: 'wi2', type: 'window', x: 2, y: 2, rotation: 0 },
      { id: 'fl1', type: 'floor', x: 3, y: 2, rotation: 0 },
    ];
    expect(CompletionValidator.isComplete(placedParts, blueprint)).toBe(true);
  });
});
