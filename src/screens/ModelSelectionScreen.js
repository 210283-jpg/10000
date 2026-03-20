import { BLUEPRINTS } from '../data/blueprints.js';

export class ModelSelectionScreen {
  constructor(container, storageService) {
    this.container = container;
    this.storageService = storageService;
  }

  render() {
    this.container.innerHTML = '';

    const title = document.createElement('h1');
    title.className = 'screen-title';
    title.textContent = '選擇模型';
    this.container.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.className = 'screen-subtitle';
    subtitle.textContent = '選擇一個模型開始建造吧！';
    this.container.appendChild(subtitle);

    const grid = document.createElement('div');
    grid.className = 'model-grid';
    this.container.appendChild(grid);

    for (const blueprint of BLUEPRINTS) {
      const card = this._createCard(blueprint);
      grid.appendChild(card);
    }
  }

  _createCard(blueprint) {
    const card = document.createElement('div');
    card.className = 'model-card';
    card.dataset.modelId = blueprint.id;

    // Determine status text and class
    let statusText = '';
    let statusClass = '';
    if (this.storageService) {
      const score = this.storageService.loadScoreRecord(blueprint.id);
      const progress = this.storageService.loadProgress(blueprint.id);
      if (score && score.completionCount > 0) {
        statusText = '已完成';
        statusClass = 'status-completed';
      } else if (progress && progress.placedParts && progress.placedParts.length > 0) {
        statusText = '進行中';
        statusClass = 'status-in-progress';
      }
    }

    const totalParts = Object.values(blueprint.requiredParts).reduce((a, b) => a + b, 0);
    const bestScore = this.storageService
      ? this.storageService.loadScoreRecord(blueprint.id)?.bestScore
      : null;

    card.innerHTML = `
      <div class="model-thumbnail">
        <span class="thumb-emoji">${this._getThumbnail(blueprint.id)}</span>
      </div>
      <div class="model-info">
        <h2 class="model-name">${blueprint.name}</h2>
        <p class="model-description">${blueprint.description || ''}</p>
        <p class="model-parts">共 ${totalParts} 個零件</p>
        ${bestScore != null ? `<p class="model-best-score">最高分: ${bestScore}</p>` : ''}
        <span class="model-status ${statusClass}">${statusText}</span>
      </div>
      <button class="btn-primary" data-action="select" data-model-id="${blueprint.id}">
        ${statusText === '進行中' ? '繼續建造' : '開始建造'}
      </button>
    `;

    card.querySelector('button[data-action="select"]').addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('game:modelSelected', {
        detail: { modelId: blueprint.id }
      }));
    });

    return card;
  }

  _getThumbnail(modelId) {
    const thumbs = {
      'house-01': '🏠',
      'car-01': '🚗',
      'robot-01': '🤖'
    };
    return thumbs[modelId] || '🎮';
  }
}
