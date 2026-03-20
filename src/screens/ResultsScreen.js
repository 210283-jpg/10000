import { ACHIEVEMENTS } from '../data/achievements.js';

/**
 * ResultsScreen — score, time, achievement badges.
 */
export class ResultsScreen {
  constructor(storageService) {
    this.storageService = storageService;
    this.container = document.getElementById('screen-results');
    this.elScore = document.getElementById('results-score');
    this.elTime = document.getElementById('results-time');
    this.elBestScore = document.getElementById('results-best-score');
    this.elAchievementsList = document.getElementById('achievements-list');

    this.container.querySelector('[data-action="replay"]').addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('game:replayRequested', { detail: { modelId: this._modelId } }));
    });
    this.container.querySelector('[data-action="menu"]').addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('game:menuRequested', { detail: {} }));
    });
  }

  show({ modelId, score, elapsedMs, unlockedAchievements = [] }) {
    this._modelId = modelId;
    this.container.classList.remove('hidden');

    this.elScore.textContent = score;

    const totalSec = Math.floor(elapsedMs / 1000);
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    this.elTime.textContent = `${mm}:${ss}`;

    const record = this.storageService.loadScoreRecord(modelId);
    this.elBestScore.textContent = record ? record.bestScore : score;

    this._renderAchievements(unlockedAchievements);
  }

  hide() {
    this.container.classList.add('hidden');
  }

  _renderAchievements(newlyUnlocked) {
    this.elAchievementsList.innerHTML = '';
    for (const ach of ACHIEVEMENTS) {
      const badge = document.createElement('div');
      badge.className = `achievement-badge${newlyUnlocked.includes(ach.id) ? ' unlocked' : ''}`;
      badge.dataset.achievementId = ach.id;
      badge.innerHTML = `
        <span class="badge-icon">${ach.icon}</span>
        <span class="badge-label">${ach.label}</span>
      `;
      badge.title = ach.description;
      this.elAchievementsList.appendChild(badge);
    }
  }
}
