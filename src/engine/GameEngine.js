import { BLUEPRINTS } from '../data/blueprints.js';
import { GameState } from './GameState.js';
import { CommandStack, PlacePieceCommand } from './CommandStack.js';
import { CompletionValidator } from './CompletionValidator.js';

export class GameEngine {
  constructor(storageService = null) {
    this.storageService = storageService;
    this.state = null;
    this.commandStack = new CommandStack();
    this.validator = new CompletionValidator();
    this.blueprint = null;
  }

  startModel(modelId) {
    this.commandStack.clear();
    this.blueprint = BLUEPRINTS.find(b => b.id === modelId);
    if (!this.blueprint) throw new Error(`Unknown model: ${modelId}`);

    // Try to restore saved progress
    if (this.storageService) {
      const saved = this.storageService.loadProgress(modelId);
      if (saved) {
        try {
          this.state = GameState.deserialize(saved, BLUEPRINTS);
          return;
        } catch (e) {
          console.warn('Failed to restore progress:', e);
        }
      }
    }
    this.state = new GameState(this.blueprint);
  }

  selectPart(partType) {
    if (this.state) this.state.selectedPartType = partType;
  }

  placePart(x, y) {
    if (!this.state) return;
    const partType = this.state.selectedPartType;
    if (!partType) {
      document.dispatchEvent(new CustomEvent('game:placementFailed', {
        detail: { reason: 'no-part-selected', x, y }
      }));
      return;
    }

    // Check quota: ensure we haven't exceeded required quantity
    const placed = this.state.placedParts.filter(p => p.type === partType).length;
    const required = this.blueprint.requiredParts[partType] || 0;
    if (placed >= required) {
      document.dispatchEvent(new CustomEvent('game:placementFailed', {
        detail: { reason: 'quota-exceeded', partType, x, y }
      }));
      return;
    }

    // Validate position
    if (!this.validator.isPlacementValid(this.state.grid, x, y, partType, this.blueprint)) {
      document.dispatchEvent(new CustomEvent('game:placementFailed', {
        detail: { reason: 'invalid-position', partType, x, y }
      }));
      return;
    }

    const placedPart = {
      id: `${partType}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: partType,
      x,
      y,
      rotation: 0
    };

    const cmd = new PlacePieceCommand(x, y, {}, placedPart, this.state);
    this.commandStack.execute(cmd);

    // Auto-save
    if (this.storageService) {
      this.storageService.saveProgress(this.state.modelId, this.state.serialize());
      document.dispatchEvent(new CustomEvent('game:progressSaved', {
        detail: { modelId: this.state.modelId }
      }));
    }

    document.dispatchEvent(new CustomEvent('game:partPlaced', {
      detail: { partType, x, y, placedPart }
    }));

    // Check completion
    if (this.validator.isComplete(this.state.grid, this.blueprint)) {
      document.dispatchEvent(new CustomEvent('game:modelCompleted', {
        detail: {
          modelId: this.state.modelId,
          elapsedMs: this.state.elapsedMs,
          score: this.state.score
        }
      }));
    }
  }

  undo() {
    if (!this.state) return;
    const result = this.commandStack.undo();
    if (result) {
      if (this.storageService) {
        this.storageService.saveProgress(this.state.modelId, this.state.serialize());
      }
      document.dispatchEvent(new CustomEvent('game:undone', {
        detail: { modelId: this.state.modelId }
      }));
    }
  }

  getState() {
    return this.state;
  }

  getBlueprint() {
    return this.blueprint;
  }
}
