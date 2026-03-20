import { PARTS } from '../data/parts.js';

const CELL_SIZE = 48;
const GRID_LINE_COLOR = '#2a2a4a';
const EMPTY_CELL_COLOR = '#111122';

/**
 * BuildScreen — canvas rendering, parts panel, HUD.
 */
export class BuildScreen {
  constructor(engine) {
    this.engine = engine;
    this.container = document.getElementById('screen-build');
    this.canvas = document.getElementById('build-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.partsList = document.getElementById('parts-list');
    this.hudScore = document.getElementById('hud-score');
    this.hudTimer = document.getElementById('hud-timer');
    this.btnUndo = document.getElementById('btn-undo');
    this.btnMenu = document.getElementById('btn-menu');

    this._boundOnPartPlaced = () => this.render();
    this._boundOnPlacementFailed = (e) => this._showFailed(e.detail.reason);
    this._boundOnUndone = () => this.render();

    this.canvas.addEventListener('click', (e) => this._onCanvasClick(e));
    this.btnUndo.addEventListener('click', () => this.engine.undo());
    this.btnMenu.addEventListener('click', () => {
      if (confirm('返回選單？目前進度已自動儲存。')) {
        document.dispatchEvent(new CustomEvent('game:menuRequested', { detail: {} }));
      }
    });
  }

  show(blueprint) {
    this.blueprint = blueprint;
    this.container.classList.remove('hidden');
    this._resizeCanvas(blueprint);
    this._renderPartsPanel(blueprint);
    this.render();
    this._attachListeners();
  }

  hide() {
    this.container.classList.add('hidden');
    this._detachListeners();
  }

  _attachListeners() {
    document.addEventListener('game:partPlaced', this._boundOnPartPlaced);
    document.addEventListener('game:placementFailed', this._boundOnPlacementFailed);
    document.addEventListener('game:undone', this._boundOnUndone);
  }

  _detachListeners() {
    document.removeEventListener('game:partPlaced', this._boundOnPartPlaced);
    document.removeEventListener('game:placementFailed', this._boundOnPlacementFailed);
    document.removeEventListener('game:undone', this._boundOnUndone);
  }

  _resizeCanvas(blueprint) {
    this.canvas.width = blueprint.gridWidth * CELL_SIZE;
    this.canvas.height = blueprint.gridHeight * CELL_SIZE;
  }

  _renderPartsPanel(blueprint) {
    this.partsList.innerHTML = '';
    const state = this.engine.getState();
    const placed = state ? state.placedParts : [];

    for (const [type, req] of Object.entries(blueprint.requiredParts)) {
      const part = PARTS[type];
      const usedCount = placed.filter(p => p.type === type).length;
      const remaining = req.quantity - usedCount;
      const isSelected = state && state.selectedPartType === type;

      const item = document.createElement('div');
      item.className = `part-item${isSelected ? ' selected' : ''}${remaining <= 0 ? ' depleted' : ''}`;
      item.dataset.partType = type;
      item.innerHTML = `
        <span class="part-icon">${part ? part.icon : '?'}</span>
        <span class="part-label">${part ? part.label : type}</span>
        <span class="part-count">${remaining}/${req.quantity}</span>
      `;
      if (remaining > 0) {
        item.addEventListener('click', () => {
          this.engine.selectPart(type);
          this._renderPartsPanel(blueprint);
        });
      }
      this.partsList.appendChild(item);
    }
  }

  render() {
    const state = this.engine.getState();
    if (!state || !this.blueprint) return;

    const { gridWidth, gridHeight, placedParts } = state;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid cells
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const px = x * CELL_SIZE;
        const py = y * CELL_SIZE;
        ctx.fillStyle = EMPTY_CELL_COLOR;
        ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = GRID_LINE_COLOR;
        ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);
      }
    }

    // Draw placed parts
    for (const part of placedParts) {
      const partDef = PARTS[part.type];
      const px = part.x * CELL_SIZE;
      const py = part.y * CELL_SIZE;
      ctx.fillStyle = partDef ? partDef.color : '#888';
      ctx.fillRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);

      // Draw icon/text in center
      ctx.font = `${Math.floor(CELL_SIZE * 0.55)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(partDef ? partDef.icon : '?', px + CELL_SIZE / 2, py + CELL_SIZE / 2);
    }

    // Update HUD score
    this.hudScore.textContent = state.score;

    // Update parts panel
    this._renderPartsPanel(this.blueprint);
  }

  updateTimer(elapsedMs) {
    const totalSec = Math.floor(elapsedMs / 1000);
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    this.hudTimer.textContent = `${mm}:${ss}`;
  }

  _onCanvasClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    const gridX = Math.floor(clickX / CELL_SIZE);
    const gridY = Math.floor(clickY / CELL_SIZE);
    this.engine.placePart(gridX, gridY);
  }

  _showFailed(reason) {
    const messages = {
      out_of_bounds: '超出範圍！',
      cell_occupied: '此格已有零件！',
      invalid_position: '此位置不合法！',
      no_remaining: '此零件已用完！',
      no_part_selected: '請先選取一個零件！',
    };
    this._toast(messages[reason] || '無法放置');
  }

  _toast(msg) {
    let el = document.getElementById('game-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'game-toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
  }
}
