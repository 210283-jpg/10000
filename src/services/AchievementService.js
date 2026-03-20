import { ACHIEVEMENTS } from '../data/achievements.js';

const STORAGE_KEY = 'game_achievements';

export class AchievementService {
  constructor() {
    this._unlocked = this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._unlocked));
    } catch (e) {
      // ignore storage errors
    }
  }

  getUnlocked() {
    return [...this._unlocked];
  }

  /**
   * Evaluate all achievements and unlock any newly satisfied ones.
   * @param {string[]} completedModels - list of completed model IDs
   * @param {number} elapsedMs - elapsed time of the most recent completion
   * @returns {string[]} newly unlocked achievement IDs
   */
  evaluateAchievements(completedModels, elapsedMs) {
    const newlyUnlocked = [];
    for (const ach of ACHIEVEMENTS) {
      if (this._unlocked.includes(ach.id)) continue;
      if (this._checkCondition(ach.condition, completedModels, elapsedMs)) {
        this._unlocked.push(ach.id);
        newlyUnlocked.push(ach.id);
      }
    }
    if (newlyUnlocked.length > 0) this._save();
    return newlyUnlocked;
  }

  _checkCondition(condition, completedModels, elapsedMs) {
    switch (condition.type) {
      case 'first-completion':
        return completedModels.length >= 1;
      case 'speed-run':
        return elapsedMs <= condition.maxMs;
      case 'all-models':
        return completedModels.length >= 3;
      default:
        return false;
    }
  }
}
