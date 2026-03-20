/**
 * ScoreService — score calculation and record persistence helpers.
 */
export class ScoreService {
  /**
   * Calculate score: base 1000 points, minus time penalty, minimum 0.
   * @param {number} elapsedMs
   * @param {number} partCount
   * @returns {number} integer score
   */
  static calculateScore(elapsedMs, partCount) {
    const base = 1000 + partCount * 10;
    const timePenalty = Math.floor(elapsedMs / 1000); // 1 point per second
    return Math.max(0, Math.floor(base - timePenalty));
  }

  /**
   * Update (or create) a ScoreRecord with new completion data.
   * @param {object|null} existing
   * @param {number} score
   * @param {number} elapsedMs
   * @returns {object} updated record
   */
  static updateRecord(existing, score, elapsedMs) {
    if (!existing) {
      return {
        bestScore: score,
        bestTimeMs: elapsedMs,
        completionCount: 1,
        lastCompletedAt: Date.now(),
      };
    }
    return {
      ...existing,
      bestScore: Math.max(existing.bestScore, score),
      bestTimeMs: Math.min(existing.bestTimeMs, elapsedMs),
      completionCount: existing.completionCount + 1,
      lastCompletedAt: Date.now(),
    };
  }
}
