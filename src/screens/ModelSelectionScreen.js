import { BLUEPRINTS } from '../data/blueprints.js';

export class ModelSelectionScreen {
  constructor(storageService = null) {
    this._storage = storageService;
  }

  render() {
    const catalog = document.getElementById('model-catalog');
    if (!catalog) return;
    catalog.innerHTML = '';

    for (const blueprint of BLUEPRINTS) {
      let status = '';
      let statusClass = '';

      if (this._storage) {
        const scoreRecord = this._storage.loadScoreRecord(blueprint.id);
        const progress = this._storage.loadProgress(blueprint.id);
        if (scoreRecord && scoreRecord.completionCount > 0) {
          status = '已完成';
          statusClass = 'completed';
        } else if (progress && progress.placedParts && progress.placedParts.length > 0) {
          status = '進行中';
          statusClass = 'in-progress';
        }
      }

      const card = document.createElement('div');
      card.className = 'model-card';
      card.dataset.modelId = blueprint.id;
      card.innerHTML = `
        <img class="model-thumbnail" src="" alt="${blueprint.name}" onerror="this.style.display='none'">
        <div class="model-name">${blueprint.name}</div>
        <div class="model-status ${statusClass}">${status}</div>
        <p style="font-size:0.8rem;color:#aaa;margin-bottom:0.5rem">${blueprint.description}</p>
        <button data-action="select">選擇</button>
      `;

      card.querySelector('button[data-action="select"]').addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('game:modelSelected', { detail: { modelId: blueprint.id } }));
      });

      catalog.appendChild(card);
    }
  }
}
