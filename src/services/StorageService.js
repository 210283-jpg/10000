const PROGRESS_VERSION = 1;

export class StorageService {
  saveProgress(progress) {
    try {
      localStorage.setItem(`game_progress_${progress.modelId}`, JSON.stringify(progress));
    } catch (e) {
      console.warn('StorageService.saveProgress failed:', e);
    }
  }

  loadProgress(modelId) {
    try {
      const raw = localStorage.getItem(`game_progress_${modelId}`);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.version !== PROGRESS_VERSION) return null;
      return data;
    } catch (e) {
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
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
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
        } catch (e) {
          // skip invalid
        }
      }
    }
    return records;
  }
}
