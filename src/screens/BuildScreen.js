import { PARTS } from '../data/parts.js';

const CELL_SIZE = 48;

export class BuildScreen {
  constructor(container, engine) {
    this.container = container;
    this.engine = engine;
    this.canvas = null;
    this.ctx = null;
    this._hoverCell = null;
    this._bound = {};
  }

  mount() {
    this.container.innerHTML = `
      <div class="build-layout">
        <aside class="parts-panel" id="parts-panel">
          <h3 class="panel-title">零件庫</h3>
          <div class="parts-list" id="parts-list"></div>
        </aside>
        <main class="build-main">
          <div class="hud">
            <div class="hud-item">
              <span class="hud-label">得分</span>
              <span id="hud-score" class="hud-value">0</span>
            </div>
            <div class="hud-item">
              <span class="hud-label">時間</span>
              <span id="hud-timer" class="hud-value">00:00</span>
            </div>
          </div>
          <div class="canvas-wrapper">
            <canvas id="build-canvas" tabindex="0"></canvas>
          </div>
          <div class="build-actions">
            <button class="btn-secondary" id="btn-undo">↩ 撤銷</button>
            <button class="btn-secondary" id="btn-menu">🏠 選單</button>
          </div>
          <div class="placement-hint" id="placement-hint" aria-live="polite"></div>
        </main>
      </div>
    `;

    this.canvas = this.container.querySelector('#build-canvas');
    this.ctx = this.canvas.getContext('2d');

    this._setupListeners();
    this._setupGameListeners();
  }

  unmount() {
    document.removeEventListener('game:partPlaced', this._bound.partPlaced);
    document.removeEventListener('game:placementFailed', this._bound.placementFailed);
    document.removeEventListener('game:undone', this._bound.undone);
    document.removeEventListener('game:modelCompleted', this._bound.modelCompleted);
  }

  _setupListeners() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
      const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
      this.engine.placePart(x, y);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this._hoverCell = {
        x: Math.floor((e.clientX - rect.left) / CELL_SIZE),
        y: Math.floor((e.clientY - rect.top) / CELL_SIZE)
      };
      this._draw();
    });

    this.canvas.addEventListener('mouseleave', () => {
      this._hoverCell = null;
      this._draw();
    });

    this.container.querySelector('#btn-undo').addEventListener('click', () => {
      this.engine.undo();
    });

    this.container.querySelector('#btn-menu').addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('game:menuRequested'));
    });
  }

  _setupGameListeners() {
    this._bound.partPlaced = () => this.refresh();
    this._bound.placementFailed = () => this._showHint('⚠️ 無法放置在此位置', 'error');
    this._bound.undone = () => this.refresh();
    this._bound.modelCompleted = () => {};

    document.addEventListener('game:partPlaced', this._bound.partPlaced);
    document.addEventListener('game:placementFailed', this._bound.placementFailed);
    document.addEventListener('game:undone', this._bound.undone);
    document.addEventListener('game:modelCompleted', this._bound.modelCompleted);
  }

  refresh() {
    const state = this.engine.getState();
    const blueprint = this.engine.getBlueprint();
    if (!state || !blueprint) return;

    // Resize canvas to fit blueprint grid
    this.canvas.width = blueprint.gridWidth * CELL_SIZE;
    this.canvas.height = blueprint.gridHeight * CELL_SIZE;

    this._renderPartsPanel(state, blueprint);
    this._draw();
    this._updateHUD(state);
  }

  _renderPartsPanel(state, blueprint) {
    const list = this.container.querySelector('#parts-list');
    if (!list) return;
    list.innerHTML = '';

    for (const [partType, required] of Object.entries(blueprint.requiredParts)) {
      const placed = state.placedParts.filter(p => p.type === partType).length;
      const remaining = required - placed;
      const def = PARTS[partType] || { icon: '?', label: partType, color: '#888' };

      const item = document.createElement('div');
      item.className = [
        'part-item',
        state.selectedPartType === partType ? 'selected' : '',
        remaining === 0 ? 'depleted' : ''
      ].filter(Boolean).join(' ');
      item.dataset.partType = partType;

      item.innerHTML = `
        <span class="part-icon">${def.icon}</span>
        <span class="part-label">${def.label}</span>
        <span class="part-count">${placed}/${required}</span>
      `;

      if (remaining > 0) {
        item.addEventListener('click', () => {
          this.engine.selectPart(partType);
          this.refresh();
        });
      }
      list.appendChild(item);
    }
  }

  _draw() {
    const state = this.engine.getState();
    const blueprint = this.engine.getBlueprint();
    if (!state || !blueprint || !this.ctx) return;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid background
    for (let y = 0; y < blueprint.gridHeight; y++) {
      for (let x = 0; x < blueprint.gridWidth; x++) {
        const px = x * CELL_SIZE;
        const py = y * CELL_SIZE;

        const bpCell = blueprint.cells.find(c => c.x === x && c.y === y);
        ctx.fillStyle = bpCell ? '#f0f4ff' : '#e8e8e8';
        ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);

        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);

        // Show faint part type hint on empty blueprint cells
        if (bpCell && !(state.grid.getCell(x, y)?.occupied)) {
          const def = PARTS[bpCell.partType];
          if (def) {
            ctx.globalAlpha = 0.2;
            ctx.font = `${CELL_SIZE * 0.45}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#333';
            ctx.fillText(def.icon, px + CELL_SIZE / 2, py + CELL_SIZE / 2);
            ctx.globalAlpha = 1.0;
          }
        }
      }
    }

    // Hover highlight
    if (this._hoverCell) {
      const { x, y } = this._hoverCell;
      const partType = state.selectedPartType;
      if (partType && blueprint.gridWidth > x && blueprint.gridHeight > y && x >= 0 && y >= 0) {
        const bpCell = blueprint.cells.find(c => c.x === x && c.y === y && c.partType === partType);
        const cell = state.grid.getCell(x, y);
        const isValid = bpCell && (!cell || !cell.occupied);
        ctx.fillStyle = isValid ? 'rgba(0,200,0,0.3)' : 'rgba(200,0,0,0.2)';
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }

    // Draw placed parts
    for (const part of state.placedParts) {
      const def = PARTS[part.type] || { color: '#888', icon: '?' };
      const px = part.x * CELL_SIZE;
      const py = part.y * CELL_SIZE;

      // Background color
      ctx.fillStyle = def.color;
      ctx.fillRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);

      // Icon
      ctx.font = `${CELL_SIZE * 0.55}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      // Draw icon shadow for readability
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 2;
      ctx.fillText(def.icon, px + CELL_SIZE / 2, py + CELL_SIZE / 2);
      ctx.shadowBlur = 0;
    }
  }

  _updateHUD(state) {
    const scoreEl = this.container.querySelector('#hud-score');
    const timerEl = this.container.querySelector('#hud-timer');
    if (scoreEl) scoreEl.textContent = state.score;
    if (timerEl) {
      const totalSec = Math.floor((state.elapsedMs || 0) / 1000);
      const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
      const ss = String(totalSec % 60).padStart(2, '0');
      timerEl.textContent = `${mm}:${ss}`;
    }
  }

  _showHint(msg, type = 'info') {
    const hint = this.container.querySelector('#placement-hint');
    if (!hint) return;
    hint.textContent = msg;
    hint.className = `placement-hint ${type}`;
    setTimeout(() => {
      hint.textContent = '';
      hint.className = 'placement-hint';
    }, 2000);
  }

  updateTimer(elapsedMs) {
    const state = this.engine.getState();
    if (state) state.elapsedMs = elapsedMs;
    this._updateHUD(state || { elapsedMs, score: 0 });
  }
}
