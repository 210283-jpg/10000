import { Grid } from './Grid.js';

const SAVE_VERSION = 1;

/**
 * GameState — mutable state for one active build session.
 */
export class GameState {
  constructor(blueprint) {
    this.modelId = blueprint.id;
    this.blueprint = blueprint;
    this.grid = new Grid(blueprint.gridWidth, blueprint.gridHeight);
    /** @type {Array<{id:string,type:string,x:number,y:number,rotation:number}>} */
    this.placedParts = [];
    this.selectedPartType = null;
    this.elapsedMs = 0;
    this.score = 0;
    this.achievements = [];
  }

  addPart(placedPart) {
    this.placedParts.push(placedPart);
  }

  removePart(partId) {
    this.placedParts = this.placedParts.filter(p => p.id !== partId);
  }

  serialize() {
    return {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      modelId: this.modelId,
      gridWidth: this.blueprint.gridWidth,
      gridHeight: this.blueprint.gridHeight,
      placedParts: [...this.placedParts],
      score: this.score,
      elapsedMs: this.elapsedMs,
      achievements: [...this.achievements],
    };
  }

  static deserialize(json, blueprints) {
    const blueprint = blueprints.find(b => b.id === json.modelId);
    if (!blueprint) throw new Error(`Unknown modelId: ${json.modelId}`);
    const state = new GameState(blueprint);
    state.elapsedMs = json.elapsedMs ?? 0;
    state.score = json.score ?? 0;
    state.achievements = json.achievements ?? [];
    // Restore placed parts and grid cells
    for (const p of json.placedParts) {
      state.placedParts.push(p);
      if (state.grid.isValidPosition(p.x, p.y)) {
        try {
          state.grid.setCell(p.x, p.y, p.id, p.type);
        } catch (_) {
          // ignore duplicate on corrupt save
        }
      }
    }
    return state;
  }
}
