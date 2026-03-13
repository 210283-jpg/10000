import { Grid } from './Grid.js';

export class GameState {
  constructor(blueprint) {
    this.modelId = blueprint.id;
    this.blueprint = blueprint;
    this.grid = new Grid(blueprint.gridWidth, blueprint.gridHeight);
    this.placedParts = [];
    this.selectedPartType = null;
    this.elapsedMs = 0;
    this.score = 0;
  }

  addPart(placedPart) {
    this.placedParts.push(placedPart);
  }

  removePart(partId) {
    this.placedParts = this.placedParts.filter(p => p.id !== partId);
  }

  serialize() {
    return {
      version: 1,
      timestamp: Date.now(),
      modelId: this.modelId,
      gridWidth: this.grid.width,
      gridHeight: this.grid.height,
      placedParts: [...this.placedParts],
      score: this.score,
      elapsedMs: this.elapsedMs,
      achievements: [],
    };
  }

  static deserialize(json, blueprints) {
    if (!json || json.version !== 1) return null;
    const blueprint = blueprints.find(b => b.id === json.modelId);
    if (!blueprint) return null;
    const state = new GameState(blueprint);
    state.elapsedMs = json.elapsedMs || 0;
    state.score = json.score || 0;
    for (const part of (json.placedParts || [])) {
      try {
        state.grid.setCell(part.x, part.y, part.id, part.type);
        state.placedParts.push(part);
      } catch (e) {
        // skip invalid/overlapping parts on restore
      }
    }
    return state;
  }
}
