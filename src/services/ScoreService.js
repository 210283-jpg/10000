import { StorageService } from './StorageService.js';

export class ScoreService {
  constructor(storageService = null) {
    this.storageService = storageService || new StorageService();
  }

  /**
   * Calculate score from elapsed time and mistakes.
   * Base: 1000 pts. Subtract 1 pt/second elapsed. Subtract 10 pts per mistake.
   */
  calculateScore(elapsedMs, mistakes = 0) {
    const base = 1000;
    const timePenalty = Math.floor(elapsedMs / 1000);
    const mistakePenalty = mistakes * 10;
    return Math.max(0, base - timePenalty - mistakePenalty);
  }

  /**
   * Update and persist the score record for a model.
   * Returns the updated record.
   */
  updateRecord(modelId, score) {
    const existing = this.storageService.loadScoreRecord(modelId);
    const record = existing || {
      modelId,
      bestScore: 0,
      bestTimeMs: Infinity,
      completionCount: 0,
      lastCompletedAt: null
    };
    if (score > record.bestScore) record.bestScore = score;
    record.completionCount = (record.completionCount || 0) + 1;
    record.lastCompletedAt = Date.now();
    this.storageService.saveScoreRecord(record);
    return record;
  }

  /**
   * Load score record for a given model.
   */
  loadRecord(modelId) {
    return this.storageService.loadScoreRecord(modelId);
  }
}
