import { describe, it, expect } from 'vitest';
import { Grid } from '../../src/engine/Grid.js';

describe('Grid', () => {
  it('initialises all cells as unoccupied', () => {
    const grid = new Grid(5, 5);
    expect(grid.getCell(0, 0).occupied).toBe(false);
    expect(grid.getCell(4, 4).occupied).toBe(false);
  });

  it('getCell returns correct cell data', () => {
    const grid = new Grid(3, 3);
    const cell = grid.getCell(1, 2);
    expect(cell).toMatchObject({ x: 1, y: 2, occupied: false, partId: null, partType: null });
  });

  it('isValidPosition rejects out-of-bounds', () => {
    const grid = new Grid(5, 5);
    expect(grid.isValidPosition(-1, 0)).toBe(false);
    expect(grid.isValidPosition(5, 0)).toBe(false);
    expect(grid.isValidPosition(0, -1)).toBe(false);
    expect(grid.isValidPosition(0, 5)).toBe(false);
  });

  it('isValidPosition accepts in-bounds', () => {
    const grid = new Grid(5, 5);
    expect(grid.isValidPosition(0, 0)).toBe(true);
    expect(grid.isValidPosition(4, 4)).toBe(true);
  });

  it('setCell marks cell occupied with partId and partType', () => {
    const grid = new Grid(5, 5);
    grid.setCell(2, 2, 'part_1', 'wall');
    const cell = grid.getCell(2, 2);
    expect(cell.occupied).toBe(true);
    expect(cell.partId).toBe('part_1');
    expect(cell.partType).toBe('wall');
  });

  it('clearCell marks cell unoccupied', () => {
    const grid = new Grid(5, 5);
    grid.setCell(1, 1, 'part_1', 'wall');
    grid.clearCell(1, 1);
    const cell = grid.getCell(1, 1);
    expect(cell.occupied).toBe(false);
    expect(cell.partId).toBe(null);
    expect(cell.partType).toBe(null);
  });

  it('setCell throws on duplicate placement', () => {
    const grid = new Grid(5, 5);
    grid.setCell(0, 0, 'part_1', 'wall');
    expect(() => grid.setCell(0, 0, 'part_2', 'roof')).toThrow();
  });

  it('toJSON and fromJSON round-trip', () => {
    const grid = new Grid(4, 4);
    grid.setCell(0, 0, 'p1', 'wall');
    const json = grid.toJSON();
    const restored = Grid.fromJSON(json);
    expect(restored.getCell(0, 0).occupied).toBe(true);
    expect(restored.getCell(0, 0).partId).toBe('p1');
    expect(restored.width).toBe(4);
    expect(restored.height).toBe(4);
  });
});
