import { ACHIEVEMENTS } from '../data/achievements.js';

export class ResultsScreen {
  show(detail) {
    const { score, elapsedMs, unlockedAchievements = [], modelId } = detail;
    this._modelId = modelId;

    const el = (id) => document.getElementById(id);
    if (el('results-score')) el('results-score').textContent = score;
    if (el('results-time')) el('results-time').textContent = this._formatTime(elapsedMs);

    const bestEl = el('results-best-score');
    if (bestEl && !bestEl._set) bestEl.textContent = score;

    // Render achievement badges
    const list = el('achievements-list');
    if (list) {
      list.innerHTML = '';
      for (const ach of ACHIEVEMENTS) {
        const badge = document.createElement('div');
        badge.className = `achievement-badge${unlockedAchievements.includes(ach.id) ? ' unlocked' : ''}`;
        badge.dataset.achievementId = ach.id;
        badge.textContent = `${ach.icon} ${ach.label}`;
        list.appendChild(badge);
      }
    }

    // Wire buttons
    const replayBtn = document.querySelector('#screen-results button[data-action="replay"]');
    const menuBtn = document.querySelector('#screen-results button[data-action="menu"]');

    if (replayBtn) {
      replayBtn.onclick = () => {
        document.dispatchEvent(new CustomEvent('game:replayRequested', { detail: { modelId } }));
      };
    }
    if (menuBtn) {
      menuBtn.onclick = () => {
        document.dispatchEvent(new CustomEvent('game:menuRequested', { detail: {} }));
      };
    }
  }

  _formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const sec = (totalSec % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  }
}
