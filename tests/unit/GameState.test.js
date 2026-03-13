import { describe, it, expect } from 'vitest';
import { GameState } from '../../src/engine/GameState.js';
import { Grid } from '../../src/engine/Grid.js';

const mockBlueprint = {
  id: 'house-01',
  gridWidth: 4,
  gridHeight: 4,
  requiredParts: { wall: { quantity: 2, validPositions: 'any' } },
};

describe('GameState', () => {
  it('initialises with empty placedParts and zero elapsedMs', () => {
    const state = new GameState(mockBlueprint);
    expect(state.placedParts).toEqual([]);
    expect(state.elapsedMs).toBe(0);
  });

  it('addPart mutates placedParts', () => {
    const state = new GameState(mockBlueprint);
    state.addPart({ id: 'p1', type: 'wall', x: 0, y: 0, rotation: 0 });
    expect(state.placedParts).toHaveLength(1);
    expect(state.placedParts[0].id).toBe('p1');
  });

  it('removePart removes by partId', () => {
    const state = new GameState(mockBlueprint);
    state.addPart({ id: 'p1', type: 'wall', x: 0, y: 0, rotation: 0 });
    state.removePart('p1');
    expect(state.placedParts).toHaveLength(0);
  });

  it('serialize/deserialize round-trip', () => {
    const state = new GameState(mockBlueprint);
    state.addPart({ id: 'p1', type: 'wall', x: 0, y: 0, rotation: 0 });
    state.elapsedMs = 5000;
    const json = state.serialize();
    expect(json.version).toBeDefined();
    const restored = GameState.deserialize(json, [mockBlueprint]);
    expect(restored.placedParts).toHaveLength(1);
    expect(restored.elapsedMs).toBe(5000);
    expect(restored.modelId).toBe('house-01');
  });
});
