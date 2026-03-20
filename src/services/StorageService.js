const SAVE_VERSION = 1;

/**
 * StorageService — versioned JSON localStorage CRUD.
 */
export class StorageService {
  _progressKey(modelId) {
    return `game_progress_${modelId}`;
  }

  _scoreKey(modelId) {
    return `game_scores_${modelId}`;
  }

  saveProgress(progress) {
    try {
      localStorage.setItem(this._progressKey(progress.modelId), JSON.stringify(progress));
    } catch (err) {
      console.warn('[StorageService] Failed to save progress:', err);
    }
  }

  loadProgress(modelId) {
    try {
      const raw = localStorage.getItem(this._progressKey(modelId));
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data.version !== SAVE_VERSION) return null;
      return data;
    } catch (err) {
      console.warn('[StorageService] Failed to load progress:', err);
      return null;
    }
  }

  clearProgress(modelId) {
    localStorage.removeItem(this._progressKey(modelId));
  }

  saveScoreRecord(record) {
    try {
      localStorage.setItem(this._scoreKey(record.modelId), JSON.stringify(record));
    } catch (err) {
      console.warn('[StorageService] Failed to save score record:', err);
    }
  }

  loadScoreRecord(modelId) {
    try {
      const raw = localStorage.getItem(this._scoreKey(modelId));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.warn('[StorageService] Failed to load score record:', err);
      return null;
    }
  }

  loadAllScoreRecords() {
    const records = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('game_scores_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data) records.push(data);
        } catch (_) {
          // skip corrupt entry
        }
      }
    }
    return records;
  }
}
