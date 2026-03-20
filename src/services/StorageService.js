const SAVE_VERSION = 1;

export class StorageService {
  saveProgress(modelId, state) {
    try {
      localStorage.setItem(`game_progress_${modelId}`, JSON.stringify(state));
    } catch (e) {
      console.warn('StorageService.saveProgress failed:', e);
    }
  }

  loadProgress(modelId) {
    try {
      const raw = localStorage.getItem(`game_progress_${modelId}`);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data.version !== SAVE_VERSION) return null;
      return data;
    } catch (e) {
      console.warn('StorageService.loadProgress failed:', e);
      return null;
    }
  }

  clearProgress(modelId) {
    localStorage.removeItem(`game_progress_${modelId}`);
  }

  saveScoreRecord(record) {
    try {
      localStorage.setItem(`game_scores_${record.modelId}`, JSON.stringify(record));
    } catch (e) {
      console.warn('StorageService.saveScoreRecord failed:', e);
    }
  }

  loadScoreRecord(modelId) {
    try {
      const raw = localStorage.getItem(`game_scores_${modelId}`);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  loadAllScoreRecords() {
    const records = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('game_scores_')) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) records.push(JSON.parse(raw));
          } catch (_) {
            // skip corrupt entries
          }
        }
      }
    } catch (e) {
      console.warn('StorageService.loadAllScoreRecords failed:', e);
    }
    return records;
  }

  // Convenience method: save a score with automatic best-score tracking
  saveScore(modelId, score) {
    try {
      const existing = this.loadScoreRecord(modelId);
      const record = existing || {
        modelId,
        bestScore: 0,
        bestTimeMs: Infinity,
        completionCount: 0,
        lastCompletedAt: null
      };
      if (score.score > record.bestScore) record.bestScore = score.score;
      if (score.elapsedMs < record.bestTimeMs) record.bestTimeMs = score.elapsedMs;
      record.completionCount = (record.completionCount || 0) + 1;
      record.lastCompletedAt = Date.now();
      this.saveScoreRecord(record);
    } catch (e) {
      console.warn('StorageService.saveScore failed:', e);
    }
  }
}
