import { GameState } from './GameState.js';
import { CommandStack, PlacePieceCommand } from './CommandStack.js';
import { CompletionValidator } from './CompletionValidator.js';
import { BLUEPRINTS } from '../data/blueprints.js';

export class GameEngine {
  constructor(storageService = null, scoreService = null, achievementService = null) {
    this._state = null;
    this._commandStack = new CommandStack();
    this._validator = new CompletionValidator();
    this._storage = storageService;
    this._scoreService = scoreService;
    this._achievementService = achievementService;
  }

  startModel(modelId) {
    const blueprint = BLUEPRINTS.find(b => b.id === modelId);
    if (!blueprint) throw new Error(`Unknown model: ${modelId}`);

    this._commandStack.clear();

    if (this._storage) {
      const saved = this._storage.loadProgress(modelId);
      if (saved) {
        const restored = GameState.deserialize(saved, BLUEPRINTS);
        if (restored) {
          this._state = restored;
          this._emit('game:progressRestored', { modelId });
          return;
        }
      }
    }

    this._state = new GameState(blueprint);
  }

  selectPart(partType) {
    if (!this._state) return;
    this._state.selectedPartType = partType;
  }

  placePart(x, y) {
    if (!this._state) return { success: false, reason: 'no_part_selected' };
    const type = this._state.selectedPartType;
    if (!type) return { success: false, reason: 'no_part_selected' };

    const placed = this._state.placedParts.filter(p => p.type === type).length;
    const required = this._state.blueprint.requiredParts[type];
    if (!required) return { success: false, reason: 'invalid_position' };
    if (placed >= required.quantity) {
      this._emit('game:placementFailed', { reason: 'no_remaining' });
      return { success: false, reason: 'no_remaining' };
    }

    if (!this._validator.isPlacementValid(type, x, y, this._state.grid, this._state.blueprint)) {
      const cell = this._state.grid.getCell(x, y);
      const reason = !this._state.grid.isValidPosition(x, y) ? 'out_of_bounds'
                   : cell.occupied ? 'cell_occupied' : 'invalid_position';
      this._emit('game:placementFailed', { reason });
      return { success: false, reason };
    }

    const partId = `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const placedPart = { id: partId, type, x, y, rotation: 0 };
    const cmd = new PlacePieceCommand(this._state.grid, this._state, placedPart);
    this._commandStack.execute(cmd);

    this._emit('game:partPlaced', { partId, partType: type, x, y, rotation: 0 });

    if (this._storage) {
      this._storage.saveProgress(this._state.serialize());
      this._emit('game:progressSaved', { modelId: this._state.modelId, timestamp: Date.now() });
    }

    if (this._validator.isComplete(this._state.grid, this._state.blueprint)) {
      let score = 0;
      let unlockedAchievements = [];
      if (this._scoreService) {
        score = this._scoreService.calculateScore(this._state.elapsedMs, this._state.placedParts.length);
        this._state.score = score;
        this._scoreService.updateRecord(this._state.modelId, score, this._state.elapsedMs);
      }
      if (this._achievementService) {
        unlockedAchievements = this._achievementService.evaluateAchievements(this._state.modelId, this._state.elapsedMs);
      }
      this._emit('game:modelCompleted', {
        modelId: this._state.modelId,
        score,
        elapsedMs: this._state.elapsedMs,
        unlockedAchievements,
      });
    }

    return { success: true, partId };
  }

  undo() {
    if (!this._state) return false;
    const result = this._commandStack.undo();
    if (result) {
      this._emit('game:undone', {});
      if (this._storage) {
        this._storage.saveProgress(this._state.serialize());
      }
    }
    return result;
  }

  getState() {
    if (!this._state) return null;
    return Object.freeze({
      modelId: this._state.modelId,
      placedParts: [...this._state.placedParts],
      selectedPartType: this._state.selectedPartType,
      elapsedMs: this._state.elapsedMs,
      score: this._state.score,
      grid: this._state.grid,
      blueprint: this._state.blueprint,
    });
  }

  tickTimer(ms) {
    if (this._state) this._state.elapsedMs += ms;
  }

  _emit(eventName, detail) {
    document.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
}
