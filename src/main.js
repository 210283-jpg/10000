import { GameEngine } from './engine/GameEngine.js';
import { ModelSelectionScreen } from './screens/ModelSelectionScreen.js';
import { BuildScreen } from './screens/BuildScreen.js';
import { ResultsScreen } from './screens/ResultsScreen.js';
import { StorageService } from './services/StorageService.js';
import { ScoreService } from './services/ScoreService.js';
import { AchievementService } from './services/AchievementService.js';
import { BLUEPRINTS } from './data/blueprints.js';

// Services
const storageService = new StorageService();
const scoreService = new ScoreService(storageService);
const achievementService = new AchievementService();
const engine = new GameEngine(storageService);

// Screen containers
const screens = {
  select:  document.getElementById('screen-model-select'),
  build:   document.getElementById('screen-build'),
  results: document.getElementById('screen-results')
};

// Screen instances
const selectionScreen = new ModelSelectionScreen(screens.select, storageService);
const buildScreen = new BuildScreen(screens.build, engine);
const resultsScreen = new ResultsScreen(screens.results, storageService, scoreService, achievementService);

// Timer state
let timerInterval = null;
let timerStart = 0;
let currentModelId = null;

// ---------- helpers ----------

function showScreen(name) {
  for (const [key, el] of Object.entries(screens)) {
    if (el) el.classList.toggle('hidden', key !== name);
  }
}

function startTimer() {
  const elapsed = engine.getState()?.elapsedMs || 0;
  timerStart = Date.now() - elapsed;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const ms = Date.now() - timerStart;
    buildScreen.updateTimer(ms);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

// ---------- event listeners ----------

// Model selected from selection screen
document.addEventListener('game:modelSelected', (e) => {
  const { modelId } = e.detail;
  currentModelId = modelId;

  // Clear previous progress when replaying
  const existingRecord = storageService.loadScoreRecord(modelId);
  const isReplay = existingRecord && existingRecord.completionCount > 0 &&
    !storageService.loadProgress(modelId);

  if (isReplay) {
    // Fresh start for replay
    engine.startModel(modelId);
  } else {
    engine.startModel(modelId);
  }

  buildScreen.mount();
  buildScreen.refresh();
  showScreen('build');
  startTimer();
});

// Menu requested (from build or results)
document.addEventListener('game:menuRequested', () => {
  stopTimer();
  buildScreen.unmount();
  selectionScreen.render();
  showScreen('select');
});

// Model completed
document.addEventListener('game:modelCompleted', (e) => {
  stopTimer();

  const { modelId } = e.detail;
  const state = engine.getState();
  const elapsed = state ? state.elapsedMs : (e.detail.elapsedMs || 0);
  const score = scoreService.calculateScore(elapsed);

  // Update score record
  scoreService.updateRecord(modelId, score);

  // Clear in-progress save
  storageService.clearProgress(modelId);

  // Determine all completed models for achievement evaluation
  const allCompleted = BLUEPRINTS
    .filter(b => {
      const rec = storageService.loadScoreRecord(b.id);
      return rec && rec.completionCount > 0;
    })
    .map(b => b.id);

  const newAchievements = achievementService.evaluateAchievements(allCompleted, elapsed);

  // Render results screen
  resultsScreen.render(modelId, score, elapsed, newAchievements);
  buildScreen.unmount();
  showScreen('results');

  // Refresh selection screen in background so status badges update
  selectionScreen.render();
});

// ---------- init ----------
selectionScreen.render();
showScreen('select');
