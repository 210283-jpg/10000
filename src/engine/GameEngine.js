import { GameState } from './GameState.js';
import { CommandStack, PlacePieceCommand } from './CommandStack.js';
import { CompletionValidator } from './CompletionValidator.js';
import { ScoreService } from '../services/ScoreService.js';

/**
 * GameEngine — top-level coordinator between state, commands, and services.
 */
export class GameEngine {
  /**
   * @param {object[]} blueprints
   * @param {import('../services/StorageService.js').StorageService} storageService
   */
  constructor(blueprints, storageService) {
    this.blueprints = blueprints;
    this.storageService = storageService;
    /** @type {GameState|null} */
    this.state = null;
    this.commandStack = new CommandStack();
  }

  /** Start or resume a model build session. */
  startModel(modelId) {
    const blueprint = this.blueprints.find(b => b.id === modelId);
    if (!blueprint) throw new Error(`Unknown modelId: ${modelId}`);

    // Try to restore saved progress
    const saved = this.storageService.loadProgress(modelId);
    if (saved) {
      try {
        this.state = GameState.deserialize(saved, this.blueprints);
      } catch (_) {
        this.state = new GameState(blueprint);
      }
    } else {
      this.state = new GameState(blueprint);
    }
    this.commandStack.clear();
  }

  selectPart(type) {
    if (!this.state) return;
    this.state.selectedPartType = type;
    document.dispatchEvent(new CustomEvent('game:partSelected', { detail: { partType: type } }));
  }

  /**
   * Attempt to place the selected part at grid (x, y).
   * @returns {{ success: boolean, partId?: string, reason?: string }}
   */
  placePart(x, y) {
    if (!this.state) return { success: false, reason: 'no_part_selected' };
    const type = this.state.selectedPartType;
    if (!type) return { success: false, reason: 'no_part_selected' };

    const blueprint = this.state.blueprint;

    // Check remaining count
    const required = blueprint.requiredParts[type]?.quantity ?? 0;
    const placed = this.state.placedParts.filter(p => p.type === type).length;
    if (placed >= required) {
      document.dispatchEvent(new CustomEvent('game:placementFailed', { detail: { reason: 'no_remaining' } }));
      return { success: false, reason: 'no_remaining' };
    }

    if (!CompletionValidator.isPlacementValid(type, x, y, this.state.grid, blueprint)) {
      const cell = this.state.grid.getCell(x, y);
      const reason = !this.state.grid.isValidPosition(x, y) ? 'out_of_bounds'
        : cell.occupied ? 'cell_occupied'
        : 'invalid_position';
      document.dispatchEvent(new CustomEvent('game:placementFailed', { detail: { reason } }));
      return { success: false, reason };
    }

    const partId = `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const placedPart = { id: partId, type, x, y, rotation: 0 };

    const cmd = new PlacePieceCommand(this.state.grid, x, y, partId, type);
    this.commandStack.execute(cmd);
    this.state.addPart(placedPart);

    // Auto-save
    this._save();

    document.dispatchEvent(new CustomEvent('game:partPlaced', {
      detail: { partId, partType: type, x, y, rotation: 0 },
    }));

    // Check completion
    if (CompletionValidator.isComplete(this.state.placedParts, blueprint)) {
      const score = ScoreService.calculateScore(this.state.elapsedMs, this.state.placedParts.length);
      this.state.score = score;

      // Update score record
      const existing = this.storageService.loadScoreRecord(blueprint.id);
      const updated = ScoreService.updateRecord(existing, score, this.state.elapsedMs);
      updated.modelId = blueprint.id;
      this.storageService.saveScoreRecord(updated);

      document.dispatchEvent(new CustomEvent('game:modelCompleted', {
        detail: { modelId: blueprint.id, score, elapsedMs: this.state.elapsedMs },
      }));
    }

    return { success: true, partId };
  }

  /** Undo last placement. */
  undo() {
    if (!this.state) return false;
    const undone = this.commandStack.undo();
    if (!undone) return false;

    // Find and remove the part that was at the last placed position
    // The grid cell has already been cleared by the command; find part without a grid cell
    // We remove the last placed part from state
    const last = this.state.placedParts[this.state.placedParts.length - 1];
    if (last) {
      this.state.removePart(last.id);
      this._save();
      document.dispatchEvent(new CustomEvent('game:undone', { detail: { partId: last.id } }));
    }
    return true;
  }

  /** Get read-only snapshot of current state. */
  getState() {
    return this.state ? Object.freeze({ ...this.state.serialize() }) : null;
  }

  /** Update elapsed time (called by timer tick). */
  tick(deltaMs) {
    if (this.state) this.state.elapsedMs += deltaMs;
  }

  _save() {
    if (this.state) {
      this.storageService.saveProgress(this.state.serialize());
      document.dispatchEvent(new CustomEvent('game:progressSaved', {
        detail: { modelId: this.state.modelId, timestamp: Date.now() },
      }));
    }
  }
}
