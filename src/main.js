import { GameEngine } from './engine/GameEngine.js';
import { ModelSelectionScreen } from './screens/ModelSelectionScreen.js';
import { BuildScreen } from './screens/BuildScreen.js';
import { ResultsScreen } from './screens/ResultsScreen.js';
import { StorageService } from './services/StorageService.js';
import { ScoreService } from './services/ScoreService.js';
import { AchievementService } from './services/AchievementService.js';

const storageService = new StorageService();
const scoreService = new ScoreService(storageService);
const achievementService = new AchievementService(storageService);
const engine = new GameEngine(storageService, scoreService, achievementService);

const modelSelectionScreen = new ModelSelectionScreen(storageService);
const buildScreen = new BuildScreen(engine);
const resultsScreen = new ResultsScreen();

let timerInterval = null;

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id)?.classList.remove('hidden');
}

function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => {
    engine.tickTimer(1000);
    const state = engine.getState();
    if (state) {
      const el = document.getElementById('hud-timer');
      if (el) {
        const totalSec = Math.floor(state.elapsedMs / 1000);
        const min = Math.floor(totalSec / 60).toString().padStart(2, '0');
        const sec = (totalSec % 60).toString().padStart(2, '0');
        el.textContent = `${min}:${sec}`;
      }
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

document.addEventListener('game:modelSelected', (e) => {
  const { modelId } = e.detail;
  engine.startModel(modelId);
  buildScreen.mount();
  showScreen('screen-build');
  buildScreen.show(modelId);
  startTimer();
});

document.addEventListener('game:partPlaced', () => {
  buildScreen.onPartPlaced();
});

document.addEventListener('game:undone', () => {
  buildScreen.onUndone();
});

document.addEventListener('game:modelCompleted', (e) => {
  stopTimer();
  const { modelId, score, elapsedMs } = e.detail;
  // Save score record if not already persisted (handles manually-fired events in tests)
  if (!storageService.loadScoreRecord(modelId)) {
    scoreService.updateRecord(modelId, score, elapsedMs);
  }
  const record = storageService.loadScoreRecord(modelId);
  const bestEl = document.getElementById('results-best-score');
  if (bestEl && record) bestEl.textContent = record.bestScore;
  resultsScreen.show(e.detail);
  showScreen('screen-results');
});

document.addEventListener('game:replayRequested', (e) => {
  const { modelId } = e.detail;
  storageService.clearProgress(modelId);
  engine.startModel(modelId);
  showScreen('screen-build');
  buildScreen.show(modelId);
  startTimer();
});

document.addEventListener('game:menuRequested', () => {
  stopTimer();
  modelSelectionScreen.render();
  showScreen('screen-model-select');
});

// Initial render
modelSelectionScreen.render();
showScreen('screen-model-select');
