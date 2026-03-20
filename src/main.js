import { BLUEPRINTS } from './data/blueprints.js';
import { GameEngine } from './engine/GameEngine.js';
import { StorageService } from './services/StorageService.js';
import { AchievementService } from './services/AchievementService.js';
import { ModelSelectionScreen } from './screens/ModelSelectionScreen.js';
import { BuildScreen } from './screens/BuildScreen.js';
import { ResultsScreen } from './screens/ResultsScreen.js';

// --- Bootstrap ---
const storageService = new StorageService();
const engine = new GameEngine(BLUEPRINTS, storageService);

const modelSelectionScreen = new ModelSelectionScreen(storageService);
const buildScreen = new BuildScreen(engine);
const resultsScreen = new ResultsScreen(storageService);

let timerInterval = null;
const allModelIds = BLUEPRINTS.map(b => b.id);

function showModelSelect() {
  stopTimer();
  buildScreen.hide();
  resultsScreen.hide();
  modelSelectionScreen.show();
}

function showBuild(modelId) {
  const blueprint = BLUEPRINTS.find(b => b.id === modelId);
  if (!blueprint) return;
  resultsScreen.hide();
  modelSelectionScreen.hide();
  engine.startModel(modelId);
  buildScreen.show(blueprint);
  startTimer();
}

function showResults(detail) {
  stopTimer();
  buildScreen.hide();
  modelSelectionScreen.hide();

  const existingUnlocked = engine.state?.achievements ?? [];
  const newlyUnlocked = AchievementService.evaluate(
    { modelId: detail.modelId, elapsedMs: detail.elapsedMs },
    existingUnlocked,
    storageService,
    allModelIds,
  );

  if (engine.state) {
    engine.state.achievements = [...existingUnlocked, ...newlyUnlocked];
    storageService.saveProgress(engine.state.serialize());
  }

  resultsScreen.show({
    modelId: detail.modelId,
    score: detail.score,
    elapsedMs: detail.elapsedMs,
    unlockedAchievements: [...existingUnlocked, ...newlyUnlocked],
  });
}

function startTimer() {
  stopTimer();
  let last = performance.now();
  timerInterval = setInterval(() => {
    const now = performance.now();
    const delta = now - last;
    last = now;
    engine.tick(delta);
    if (engine.state) {
      buildScreen.updateTimer(engine.state.elapsedMs);
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// --- Event wiring ---
document.addEventListener('game:modelSelected', (e) => showBuild(e.detail.modelId));
document.addEventListener('game:modelCompleted', (e) => showResults(e.detail));
document.addEventListener('game:menuRequested', () => showModelSelect());
document.addEventListener('game:replayRequested', (e) => showBuild(e.detail.modelId));

// --- Initial screen ---
showModelSelect();
