import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../../src/engine/GameState.js';

const mockBlueprint = {
  id: 'house-01',
  name: '小屋',
  gridWidth: 8,
  gridHeight: 8,
  requiredParts: { wall: 4, roof: 2, door: 1 },
  cells: [
    { x: 0, y: 0, partType: 'wall' },
    { x: 1, y: 0, partType: 'wall' },
    { x: 2, y: 0, partType: 'wall' },
    { x: 3, y: 0, partType: 'wall' },
    { x: 4, y: 0, partType: 'roof' },
    { x: 5, y: 0, partType: 'roof' },
    { x: 6, y: 0, partType: 'door' }
  ]
};

const mockBlueprints = [mockBlueprint];

describe('GameState', () => {
  let state;

  beforeEach(() => {
    state = new GameState(mockBlueprint);
  });

  describe('constructor', () => {
    it('sets modelId from blueprint', () => {
      expect(state.modelId).toBe('house-01');
    });

    it('initialises placedParts as empty array', () => {
      expect(state.placedParts).toEqual([]);
    });

    it('initialises elapsedMs to 0', () => {
      expect(state.elapsedMs).toBe(0);
    });

    it('initialises score to 0', () => {
      expect(state.score).toBe(0);
    });

    it('initialises selectedPartType to null', () => {
      expect(state.selectedPartType).toBeNull();
    });

    it('creates a grid with correct dimensions', () => {
      expect(state.grid.width).toBe(8);
      expect(state.grid.height).toBe(8);
    });
  });

  describe('addPart', () => {
    it('adds part to placedParts array', () => {
      state.addPart({ id: 'wall_1', type: 'wall', x: 0, y: 0, rotation: 0 });
      expect(state.placedParts).toHaveLength(1);
      expect(state.placedParts[0].type).toBe('wall');
    });

    it('marks grid cell as occupied', () => {
      state.addPart({ id: 'wall_1', type: 'wall', x: 0, y: 0, rotation: 0 });
      const cell = state.grid.getCell(0, 0);
      expect(cell?.occupied).toBe(true);
      expect(cell?.partType).toBe('wall');
    });

    it('stores partId in grid cell', () => {
      state.addPart({ id: 'wall_1', type: 'wall', x: 2, y: 3, rotation: 0 });
      const cell = state.grid.getCell(2, 3);
      expect(cell?.partId).toBe('wall_1');
    });
  });

  describe('removePart', () => {
    beforeEach(() => {
      state.addPart({ id: 'roof_1', type: 'roof', x: 4, y: 0, rotation: 0 });
    });

    it('removes part from placedParts array', () => {
      state.removePart('roof_1');
      expect(state.placedParts).toHaveLength(0);
    });

    it('clears grid cell', () => {
      state.removePart('roof_1');
      expect(state.grid.getCell(4, 0)).toBeNull();
    });

    it('does nothing for unknown partId', () => {
      expect(() => state.removePart('nonexistent')).not.toThrow();
      expect(state.placedParts).toHaveLength(1);
    });
  });

  describe('serialize', () => {
    it('includes version field = 1', () => {
      const serialized = state.serialize();
      expect(serialized.version).toBe(1);
    });

    it('includes modelId', () => {
      const serialized = state.serialize();
      expect(serialized.modelId).toBe('house-01');
    });

    it('includes timestamp as a number', () => {
      const serialized = state.serialize();
      expect(typeof serialized.timestamp).toBe('number');
    });

    it('includes placedParts snapshot', () => {
      state.addPart({ id: 'door_1', type: 'door', x: 6, y: 0, rotation: 0 });
      const serialized = state.serialize();
      expect(serialized.placedParts).toHaveLength(1);
    });

    it('includes elapsedMs and score', () => {
      state.elapsedMs = 5000;
      state.score = 200;
      const serialized = state.serialize();
      expect(serialized.elapsedMs).toBe(5000);
      expect(serialized.score).toBe(200);
    });
  });

  describe('deserialize', () => {
    it('restores state from serialized data', () => {
      state.addPart({ id: 'wall_1', type: 'wall', x: 0, y: 0, rotation: 0 });
      state.elapsedMs = 12000;
      state.score = 100;
      const serialized = state.serialize();

      const restored = GameState.deserialize(serialized, mockBlueprints);
      expect(restored.modelId).toBe('house-01');
      expect(restored.placedParts).toHaveLength(1);
      expect(restored.elapsedMs).toBe(12000);
      expect(restored.score).toBe(100);
    });

    it('round-trips correctly – grid cell is occupied after deserialization', () => {
      state.addPart({ id: 'wall_1', type: 'wall', x: 0, y: 0, rotation: 0 });
      const restored = GameState.deserialize(state.serialize(), mockBlueprints);
      expect(restored.grid.getCell(0, 0)?.occupied).toBe(true);
    });

    it('throws for unknown modelId', () => {
      expect(() =>
        GameState.deserialize({ version: 1, modelId: 'unknown-99', placedParts: [] }, mockBlueprints)
      ).toThrow();
    });
  });
});
