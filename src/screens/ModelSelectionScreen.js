import { BLUEPRINTS } from '../data/blueprints.js';
import { PARTS } from '../data/parts.js';

const CELL_SIZE = 48;

/**
 * ModelSelectionScreen — renders the model catalog with status badges.
 */
export class ModelSelectionScreen {
  constructor(storageService) {
    this.storageService = storageService;
    this.container = document.getElementById('screen-model-select');
    this.modelGrid = document.getElementById('model-grid');
  }

  show() {
    this.container.classList.remove('hidden');
    this.render();
  }

  hide() {
    this.container.classList.add('hidden');
  }

  render() {
    this.modelGrid.innerHTML = '';
    for (const blueprint of BLUEPRINTS) {
      const progress = this.storageService.loadProgress(blueprint.id);
      const scoreRecord = this.storageService.loadScoreRecord(blueprint.id);
      const card = this._createCard(blueprint, progress, scoreRecord);
      this.modelGrid.appendChild(card);
    }
  }

  _createCard(blueprint, progress, scoreRecord) {
    const card = document.createElement('div');
    card.className = 'model-card';
    card.dataset.modelId = blueprint.id;

    const isCompleted = scoreRecord && scoreRecord.completionCount > 0;
    const isInProgress = progress && progress.placedParts.length > 0 && !isCompleted;

    let statusText = '';
    let statusClass = '';
    if (isCompleted) {
      statusText = '已完成';
      statusClass = 'completed';
    } else if (isInProgress) {
      statusText = '進行中';
      statusClass = 'in-progress';
    }

    const totalParts = Object.values(blueprint.requiredParts).reduce((s, r) => s + r.quantity, 0);
    const partList = Object.entries(blueprint.requiredParts)
      .map(([type, req]) => {
        const part = PARTS[type];
        return `${part ? part.icon : '?'}×${req.quantity}`;
      })
      .join(' ');

    card.innerHTML = `
      <img class="model-thumbnail" src="${blueprint.thumbnail}" alt="${blueprint.name}" width="80" height="80" />
      <div class="model-name">${blueprint.name}</div>
      <div class="model-description">${blueprint.description}</div>
      <div class="model-status ${statusClass}">${statusText}</div>
      <div class="model-parts-hint" style="font-size:0.75rem;color:var(--color-text-dim)">${partList} (共${totalParts}件)</div>
      <button data-action="select">開始建造</button>
    `;

    card.querySelector('button[data-action="select"]').addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('game:modelSelected', { detail: { modelId: blueprint.id } }));
    });

    return card;
  }
}
