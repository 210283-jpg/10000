export class ScoreService {
  constructor(storageService) {
    this._storage = storageService;
  }

  calculateScore(elapsedMs, totalPartsPlaced) {
    const base = 1000;
    const timePenalty = Math.floor(elapsedMs / 1000);
    return Math.max(0, base - timePenalty + totalPartsPlaced * 10);
  }

  updateRecord(modelId, score, elapsedMs) {
    const existing = this._storage.loadScoreRecord(modelId);
    const record = existing ? { ...existing } : {
      modelId,
      bestScore: 0,
      bestTimeMs: Infinity,
      completionCount: 0,
      lastCompletedAt: null,
    };
    if (score > record.bestScore) record.bestScore = score;
    if (elapsedMs < record.bestTimeMs) record.bestTimeMs = elapsedMs;
    record.completionCount += 1;
    record.lastCompletedAt = Date.now();
    this._storage.saveScoreRecord(record);
  }

  loadRecord(modelId) {
    return this._storage.loadScoreRecord(modelId);
  }
}
