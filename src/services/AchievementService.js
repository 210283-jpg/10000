import { ACHIEVEMENTS } from '../data/achievements.js';

/**
 * AchievementService — evaluates and unlocks achievement badges.
 */
export class AchievementService {
  /**
   * Evaluate which achievements should be unlocked after a model completion.
   * @param {{ modelId: string, elapsedMs: number }} completionData
   * @param {string[]} existingUnlocked - already unlocked achievement IDs
   * @param {import('../services/StorageService.js').StorageService} storageService
   * @param {string[]} allModelIds - IDs of all available models
   * @returns {string[]} newly unlocked achievement IDs
   */
  static evaluate(completionData, existingUnlocked, storageService, allModelIds) {
    const newlyUnlocked = [];
    const allRecords = storageService.loadAllScoreRecords();
    const completedModelIds = allRecords
      .filter(r => r.completionCount > 0)
      .map(r => r.modelId);

    for (const achievement of ACHIEVEMENTS) {
      if (existingUnlocked.includes(achievement.id)) continue;

      let unlocked = false;
      const cond = achievement.condition;

      if (cond.type === 'first-completion') {
        if (!cond.modelId || cond.modelId === completionData.modelId) {
          unlocked = true;
        }
      } else if (cond.type === 'speed-run') {
        if (completionData.elapsedMs <= cond.maxMs) {
          unlocked = true;
        }
      } else if (cond.type === 'all-models') {
        const allDone = allModelIds.every(id => completedModelIds.includes(id));
        unlocked = allDone;
      }

      if (unlocked) newlyUnlocked.push(achievement.id);
    }
    return newlyUnlocked;
  }
}
