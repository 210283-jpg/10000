import { describe, it, expect } from 'vitest';
import { Grid } from '../../src/engine/Grid.js';

describe('Grid', () => {
  it('initialises all cells as unoccupied', () => {
    const grid = new Grid(5, 5);
    expect(grid.getCell(0, 0).occupied).toBe(false);
    expect(grid.getCell(4, 4).occupied).toBe(false);
  });

  it('getCell returns correct cell data', () => {
    const grid = new Grid(4, 4);
    const cell = grid.getCell(2, 3);
    expect(cell.x).toBe(2);
    expect(cell.y).toBe(3);
    expect(cell.occupied).toBe(false);
    expect(cell.partId).toBeNull();
    expect(cell.partType).toBeNull();
  });

  it('isValidPosition rejects out-of-bounds coordinates', () => {
    const grid = new Grid(5, 5);
    expect(grid.isValidPosition(-1, 0)).toBe(false);
    expect(grid.isValidPosition(5, 0)).toBe(false);
    expect(grid.isValidPosition(0, -1)).toBe(false);
    expect(grid.isValidPosition(0, 5)).toBe(false);
  });

  it('isValidPosition accepts valid coordinates', () => {
    const grid = new Grid(5, 5);
    expect(grid.isValidPosition(0, 0)).toBe(true);
    expect(grid.isValidPosition(4, 4)).toBe(true);
    expect(grid.isValidPosition(2, 3)).toBe(true);
  });

  it('setCell marks cell occupied with partId and partType', () => {
    const grid = new Grid(5, 5);
    grid.setCell(1, 2, 'part-001', 'wall');
    const cell = grid.getCell(1, 2);
    expect(cell.occupied).toBe(true);
    expect(cell.partId).toBe('part-001');
    expect(cell.partType).toBe('wall');
  });

  it('clearCell marks cell unoccupied', () => {
    const grid = new Grid(5, 5);
    grid.setCell(1, 2, 'part-001', 'wall');
    grid.clearCell(1, 2);
    const cell = grid.getCell(1, 2);
    expect(cell.occupied).toBe(false);
    expect(cell.partId).toBeNull();
    expect(cell.partType).toBeNull();
  });

  it('setCell throws when cell is already occupied', () => {
    const grid = new Grid(5, 5);
    grid.setCell(1, 2, 'part-001', 'wall');
    expect(() => grid.setCell(1, 2, 'part-002', 'roof')).toThrow();
  });

  it('toJSON / fromJSON round-trips correctly', () => {
    const grid = new Grid(3, 3);
    grid.setCell(0, 0, 'p1', 'wall');
    const json = grid.toJSON();
    const restored = Grid.fromJSON(json);
    expect(restored.width).toBe(3);
    expect(restored.height).toBe(3);
    expect(restored.getCell(0, 0).occupied).toBe(true);
    expect(restored.getCell(0, 0).partId).toBe('p1');
    expect(restored.getCell(1, 1).occupied).toBe(false);
  });
});
