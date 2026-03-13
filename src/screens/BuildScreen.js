import { PARTS } from '../data/parts.js';

const CELL_SIZE = 48;

export class BuildScreen {
  constructor(engine) {
    this._engine = engine;
    this._canvas = null;
    this._ctx = null;
    this._bound = {};
  }

  mount() {
    this._canvas = document.getElementById('build-canvas');
    this._ctx = this._canvas ? this._canvas.getContext('2d') : null;

    const btnUndo = document.getElementById('btn-undo');
    const btnMenu = document.getElementById('btn-menu');

    this._bound.canvasClick = (e) => this._onCanvasClick(e);
    this._bound.undo = () => this._engine.undo();
    this._bound.menu = () => {
      if (confirm('確定要返回選單嗎？（進度已自動儲存）')) {
        document.dispatchEvent(new CustomEvent('game:menuRequested', { detail: {} }));
      }
    };

    this._canvas.addEventListener('click', this._bound.canvasClick);
    btnUndo?.addEventListener('click', this._bound.undo);
    btnMenu?.addEventListener('click', this._bound.menu);
  }

  show(modelId) {
    const state = this._engine.getState();
    if (!state) return;

    const blueprint = state.blueprint;
    this._canvas.width = blueprint.gridWidth * CELL_SIZE;
    this._canvas.height = blueprint.gridHeight * CELL_SIZE;

    this._renderPartsPanel(state);
    this._renderCanvas(state);
  }

  _onCanvasClick(e) {
    const rect = this._canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const gridX = Math.floor(clickX / CELL_SIZE);
    const gridY = Math.floor(clickY / CELL_SIZE);
    this._engine.placePart(gridX, gridY);
    const state = this._engine.getState();
    if (state) {
      this._renderPartsPanel(state);
      this._renderCanvas(state);
    }
  }

  _renderCanvas(state) {
    if (!this._ctx) return;
    const { grid, blueprint } = state;
    const ctx = this._ctx;
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#334';
    ctx.lineWidth = 1;
    for (let x = 0; x <= blueprint.gridWidth; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, blueprint.gridHeight * CELL_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= blueprint.gridHeight; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(blueprint.gridWidth * CELL_SIZE, y * CELL_SIZE);
      ctx.stroke();
    }

    // Draw placed parts
    for (const part of state.placedParts) {
      const partDef = PARTS[part.type];
      const px = part.x * CELL_SIZE;
      const py = part.y * CELL_SIZE;

      ctx.fillStyle = partDef ? partDef.color : '#666';
      ctx.fillRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);

      if (partDef) {
        ctx.font = `${CELL_SIZE * 0.55}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(partDef.icon, px + CELL_SIZE / 2, py + CELL_SIZE / 2);
      }
    }
  }

  _renderPartsPanel(state) {
    const panel = document.getElementById('parts-panel');
    if (!panel) return;
    panel.innerHTML = '<h3>零件</h3>';

    const { blueprint, placedParts, selectedPartType } = state;
    for (const [type, req] of Object.entries(blueprint.requiredParts)) {
      const partDef = PARTS[type];
      const usedCount = placedParts.filter(p => p.type === type).length;
      const remaining = req.quantity - usedCount;
      const isSelected = type === selectedPartType;
      const isDepleted = remaining <= 0;

      const item = document.createElement('div');
      item.className = `part-item${isSelected ? ' selected' : ''}${isDepleted ? ' depleted' : ''}`;
      item.dataset.partType = type;
      item.innerHTML = `
        <span class="part-icon">${partDef ? partDef.icon : '?'}</span>
        <span class="part-label">${partDef ? partDef.label : type}</span>
        <span class="part-count">${remaining}</span>
      `;

      if (!isDepleted) {
        item.addEventListener('click', () => {
          this._engine.selectPart(type);
          const newState = this._engine.getState();
          if (newState) this._renderPartsPanel(newState);
        });
      }

      panel.appendChild(item);
    }
  }

  onPartPlaced() {
    const state = this._engine.getState();
    if (state) {
      this._renderPartsPanel(state);
      this._renderCanvas(state);
    }
  }

  onUndone() {
    const state = this._engine.getState();
    if (state) {
      this._renderPartsPanel(state);
      this._renderCanvas(state);
    }
  }
}
