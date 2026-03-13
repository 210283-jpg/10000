# Quickstart: 模型建構遊戲 (Model Building Game)

**Feature Branch**: `001-model-building-game`  
**Date**: 2026-03-13

This guide helps a developer understand the planned project structure, set up the development environment, and run the test suite.

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20 LTS | Vitest test runner, Playwright |
| npm | 9+ | Package management |
| A modern browser | Chrome/Edge/Firefox (last 2 versions) | Manual testing |
| Git | any | Version control |

---

## Planned Project Structure

```text
/                          ← repo root
├── index.html             ← single HTML entry point
├── style.css              ← global styles
├── src/
│   ├── main.js            ← app bootstrap, ScreenManager init
│   ├── engine/
│   │   ├── GameEngine.js       ← top-level coordinator
│   │   ├── Grid.js             ← grid state
│   │   ├── GameState.js        ← mutable game state
│   │   ├── CommandStack.js     ← undo/redo (Command pattern)
│   │   └── CompletionValidator.js
│   ├── screens/
│   │   ├── ModelSelectionScreen.js
│   │   ├── BuildScreen.js
│   │   └── ResultsScreen.js
│   ├── services/
│   │   ├── StorageService.js   ← localStorage save/load
│   │   ├── ScoreService.js     ← score calc and record
│   │   └── AchievementService.js
│   └── data/
│       ├── blueprints.js       ← ModelBlueprint seed data (house, car, robot)
│       ├── parts.js            ← PartDefinition catalog
│       └── achievements.js     ← AchievementDefinition list
├── tests/
│   ├── unit/
│   │   ├── Grid.test.js
│   │   ├── GameState.test.js
│   │   ├── CommandStack.test.js
│   │   ├── CompletionValidator.test.js
│   │   ├── StorageService.test.js
│   │   └── ScoreService.test.js
│   └── e2e/
│       └── gameplay.spec.js    ← Playwright end-to-end tests
├── specs/                 ← speckit design artifacts (this directory)
├── package.json
└── vite.config.js (optional, for local dev server)
```

---

## Setup (after implementation begins)

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests (Vitest)
npm test

# 3. Run tests in watch mode
npm run test:watch

# 4. Run E2E tests (requires local server)
npm run test:e2e

# 5. Serve locally for manual testing (no build step required for vanilla JS)
npx serve .
# or with vite:
npm run dev
```

---

## Architecture Overview

### Game Loop (Build Screen)

```
Player clicks part in parts panel
  ──► GameEngine.selectPart(type)
      ──► BuildScreen highlights selected part item

Player clicks grid cell on canvas
  ──► BuildScreen maps pixel → grid (x, y)
  ──► GameEngine.placePart(x, y)
      ──► CompletionValidator.validate(type, x, y)
      ──► CommandStack.execute(new PlacePieceCommand(...))
      ──► Grid.setCell(x, y, partId, partType)
      ──► StorageService.saveProgress(...)    ← auto-save
      ──► BuildScreen.render()               ← redraw canvas
      ──► CompletionValidator.checkCompletion()
            ──► if complete: emit game:modelCompleted
```

### Save / Restore Flow

```
On page load:
  ──► StorageService.loadProgress(modelId)
      ──► if valid: GameState.restore(savedData)
      ──► BuildScreen.render() shows restored grid

After each placement:
  ──► StorageService.saveProgress(gameState.serialize())
```

---

## Key Design Decisions (see research.md for details)

| Decision | Choice |
|----------|--------|
| Rendering | Vanilla JS + HTML5 Canvas |
| Persistence | versioned JSON in localStorage |
| Undo/Redo | Command Pattern, max 50 stack depth |
| Testing | Vitest (unit) + Playwright (E2E) |
| Grid representation | flat dict `{ "x,y": Cell }` |
| Deployment | GitHub Pages (static, no build required) |

---

## TDD Workflow (per constitution CA-003)

For each implementation task:

1. **Write failing test** – describe the expected behaviour.
2. **Verify test fails** – `npm test` shows RED.
3. **Implement minimum code** – make the test pass.
4. **Verify test passes** – `npm test` shows GREEN.
5. **Refactor** if needed, keep tests GREEN.

Example first test to write (Grid.test.js):

```javascript
import { describe, it, expect } from 'vitest';
import { Grid } from '../../src/engine/Grid.js';

describe('Grid', () => {
  it('initialises all cells as unoccupied', () => {
    const grid = new Grid(5, 5);
    expect(grid.getCell(0, 0).occupied).toBe(false);
    expect(grid.getCell(4, 4).occupied).toBe(false);
  });

  it('rejects out-of-bounds coordinates', () => {
    const grid = new Grid(5, 5);
    expect(grid.isValidPosition(-1, 0)).toBe(false);
    expect(grid.isValidPosition(5, 0)).toBe(false);
  });
});
```

---

## GitHub Pages Deployment

The game is entirely static (HTML + CSS + JS). No build step is required.

```bash
# Enable GitHub Pages on the repo:
# Settings → Pages → Source: Deploy from branch → main / root

# The game will be accessible at:
# https://<username>.github.io/<repo>/
```

If a Vite dev server is used during development, `npm run build` produces a `dist/` folder that can also be served from Pages.

---

## Git Checkpoints (per constitution CA-004)

| Milestone | Tag | Command |
|-----------|-----|---------|
| Spec complete | `spec-001` | `git tag spec-001 && git push origin spec-001` |
| Plan complete | `plan-001` | `git tag plan-001 && git push origin plan-001` |
| Implementation complete | `impl-001` | `git tag impl-001 && git push origin impl-001` |
