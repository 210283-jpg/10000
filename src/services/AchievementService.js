import { ACHIEVEMENTS } from '../data/achievements.js';
import { BLUEPRINTS } from '../data/blueprints.js';

export class AchievementService {
  constructor(storageService) {
    this._storage = storageService;
  }

  evaluateAchievements(modelId, elapsedMs) {
    const unlocked = [];
    const allRecords = this._storage.loadAllScoreRecords();

    for (const ach of ACHIEVEMENTS) {
      if (this._check(ach, modelId, elapsedMs, allRecords)) {
        unlocked.push(ach.id);
      }
    }
    return unlocked;
  }

  _check(ach, modelId, elapsedMs, allRecords) {
    const { condition } = ach;
    switch (condition.type) {
      case 'first-completion': {
        const record = allRecords.find(r =>
          (!condition.modelId || r.modelId === condition.modelId) && r.completionCount >= 1
        );
        return !!record;
      }
      case 'speed-run': {
        const record = allRecords.find(r => r.modelId === modelId && r.completionCount >= 1);
        return !!record && elapsedMs <= condition.maxMs;
      }
      case 'all-models': {
        const completedModels = new Set(allRecords.filter(r => r.completionCount >= 1).map(r => r.modelId));
        return BLUEPRINTS.every(b => completedModels.has(b.id));
      }
      default:
        return false;
    }
  }
}
