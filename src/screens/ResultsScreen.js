import { ACHIEVEMENTS } from '../data/achievements.js';

export class ResultsScreen {
  constructor(container, storageService, scoreService, achievementService) {
    this.container = container;
    this.storageService = storageService;
    this.scoreService = scoreService;
    this.achievementService = achievementService;
  }

  render(modelId, score, elapsedMs, newAchievements = []) {
    const record = this.storageService ? this.storageService.loadScoreRecord(modelId) : null;
    const bestScore = record ? record.bestScore : score;
    const completionCount = record ? record.completionCount : 1;
    const unlockedIds = this.achievementService ? this.achievementService.getUnlocked() : [];

    const totalSec = Math.floor(elapsedMs / 1000);
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');

    this.container.innerHTML = `
      <div class="results-layout">
        <div class="results-confetti" aria-hidden="true">🎉 🎊 🎉 🎊 🎉</div>
        <h1 class="results-title">🎉 恭喜完成！</h1>

        <div class="results-score-box">
          <div class="results-score-item">
            <span class="results-label">本次得分</span>
            <span class="results-value score-highlight">${score}</span>
          </div>
          <div class="results-score-item">
            <span class="results-label">完成時間</span>
            <span class="results-value">${mm}:${ss}</span>
          </div>
          <div class="results-score-item">
            <span class="results-label">最高分</span>
            <span class="results-value">${bestScore}</span>
          </div>
          <div class="results-score-item">
            <span class="results-label">完成次數</span>
            <span class="results-value">${completionCount}</span>
          </div>
        </div>

        ${newAchievements.length > 0 ? `
        <div class="new-achievements">
          <h3>🏆 新成就解鎖！</h3>
          <div class="new-achievement-badges">
            ${newAchievements.map(id => {
              const a = ACHIEVEMENTS.find(x => x.id === id);
              return a ? `<div class="achievement-badge new">${a.icon} <strong>${a.label}</strong><br><small>${a.description}</small></div>` : '';
            }).join('')}
          </div>
        </div>
        ` : ''}

        <div class="achievements-section">
          <h3>成就列表</h3>
          <div class="achievements-list">
            ${ACHIEVEMENTS.map(a => `
              <div class="achievement-badge ${unlockedIds.includes(a.id) ? 'unlocked' : 'locked'}">
                <span class="achievement-icon">${a.icon}</span>
                <div class="achievement-info">
                  <strong>${a.label}</strong>
                  <span class="achievement-desc">${a.description}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="results-actions">
          <button class="btn-primary" id="btn-replay">🔄 再玩一次</button>
          <button class="btn-secondary" id="btn-menu">🏠 返回選單</button>
        </div>
      </div>
    `;

    this.container.querySelector('#btn-replay').addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('game:modelSelected', { detail: { modelId } }));
    });

    this.container.querySelector('#btn-menu').addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('game:menuRequested'));
    });
  }
}
