import { Grid } from './Grid.js';

export class GameState {
  constructor(blueprint) {
    this.modelId = blueprint.id;
    this.grid = new Grid(blueprint.gridWidth, blueprint.gridHeight);
    this.placedParts = [];
    this.selectedPartType = null;
    this.elapsedMs = 0;
    this.score = 0;
  }

  addPart(placedPart) {
    this.placedParts.push(placedPart);
    this.grid.setCell(placedPart.x, placedPart.y, {
      occupied: true,
      partId: placedPart.id,
      partType: placedPart.type
    });
  }

  removePart(partId) {
    const idx = this.placedParts.findIndex(p => p.id === partId);
    if (idx === -1) return;
    const part = this.placedParts[idx];
    this.grid.clearCell(part.x, part.y);
    this.placedParts.splice(idx, 1);
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
      elapsedMs: this.elapsedMs
    };
  }

  static deserialize(data, blueprints) {
    const blueprint = blueprints.find(b => b.id === data.modelId);
    if (!blueprint) throw new Error(`Blueprint not found: ${data.modelId}`);
    const state = new GameState(blueprint);
    state.elapsedMs = data.elapsedMs || 0;
    state.score = data.score || 0;
    for (const part of (data.placedParts || [])) {
      state.addPart(part);
    }
    return state;
  }
}
