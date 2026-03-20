import { describe, it, expect } from 'vitest';
import { GameState } from '../../src/engine/GameState.js';
import { BLUEPRINTS } from '../../src/data/blueprints.js';

const blueprint = BLUEPRINTS[0]; // house-01

describe('GameState', () => {
  it('initialises with placedParts=[] and elapsedMs=0', () => {
    const state = new GameState(blueprint);
    expect(state.placedParts).toEqual([]);
    expect(state.elapsedMs).toBe(0);
    expect(state.score).toBe(0);
  });

  it('addPart appends to placedParts', () => {
    const state = new GameState(blueprint);
    const part = { id: 'p1', type: 'wall', x: 0, y: 0, rotation: 0 };
    state.addPart(part);
    expect(state.placedParts).toHaveLength(1);
    expect(state.placedParts[0]).toEqual(part);
  });

  it('removePart removes by id', () => {
    const state = new GameState(blueprint);
    state.addPart({ id: 'p1', type: 'wall', x: 0, y: 0, rotation: 0 });
    state.addPart({ id: 'p2', type: 'roof', x: 1, y: 0, rotation: 0 });
    state.removePart('p1');
    expect(state.placedParts).toHaveLength(1);
    expect(state.placedParts[0].id).toBe('p2');
  });

  it('serialize produces object with version field', () => {
    const state = new GameState(blueprint);
    const json = state.serialize();
    expect(json.version).toBeDefined();
    expect(json.modelId).toBe('house-01');
    expect(json.placedParts).toEqual([]);
  });

  it('deserialize round-trips to equal state', () => {
    const state = new GameState(blueprint);
    state.addPart({ id: 'p1', type: 'wall', x: 0, y: 0, rotation: 0 });
    state.elapsedMs = 5000;
    const json = state.serialize();
    const restored = GameState.deserialize(json, BLUEPRINTS);
    expect(restored.modelId).toBe(state.modelId);
    expect(restored.placedParts).toHaveLength(1);
    expect(restored.elapsedMs).toBe(5000);
  });
});
