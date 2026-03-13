# UI Contracts: 模型建構遊戲 (Model Building Game)

**Feature Branch**: `001-model-building-game`  
**Phase**: 1 – Design  
**Date**: 2026-03-13

> This document defines the UI contracts—screen layouts, interactive elements, DOM structure conventions, and event interfaces—that govern how the game's front-end components interact. These contracts must remain stable between implementation and testing.

---

## Screens

### Screen 1: Model Selection Screen (`#screen-model-select`)

**Activated when**: page loads fresh, or player returns from Results screen.

#### Required DOM elements

| Selector | Role |
|----------|------|
| `#screen-model-select` | Root container (`<section>`) |
| `.model-card[data-model-id]` | One card per available model (≥ 3) |
| `.model-card .model-thumbnail` | `<img>` element with model thumbnail |
| `.model-card .model-name` | Display name of the model |
| `.model-card .model-status` | Badge: `""` (not started), `"進行中"`, or `"已完成"` |
| `.model-card button[data-action="select"]` | Triggers model selection |

#### Events emitted (CustomEvent on `document`)

| Event | `detail` shape | When |
|-------|---------------|------|
| `game:modelSelected` | `{ modelId: string }` | Player clicks a select button |

---

### Screen 2: Build Screen (`#screen-build`)

**Activated when**: `game:modelSelected` is received.

#### Required DOM elements

| Selector | Role |
|----------|------|
| `#screen-build` | Root container (`<section>`) |
| `#build-canvas` | `<canvas>` element for grid rendering |
| `#parts-panel` | Sidebar listing available parts |
| `.part-item[data-part-type]` | One item per unique part type in the current model |
| `.part-item .part-count` | Remaining available count |
| `.part-item.selected` | Applied when this part is the active selection |
| `#hud-score` | Displays current score (0 during build) |
| `#hud-timer` | Displays elapsed time `MM:SS` |
| `#btn-undo` | Undo last placement |
| `#btn-menu` | Return to model selection (with confirmation) |

#### Canvas Coordinate Contract

The canvas renders the grid; each cell has a fixed pixel size (`CELL_SIZE` constant, recommended 48px).

- Cell at grid `(x, y)` renders at canvas pixel `(x * CELL_SIZE, y * CELL_SIZE)`.
- Click coordinates on the canvas map to grid cells via: `gridX = Math.floor(clickX / CELL_SIZE)`, `gridY = Math.floor(clickY / CELL_SIZE)`.

#### Events emitted (CustomEvent on `document`)

| Event | `detail` shape | When |
|-------|---------------|------|
| `game:partSelected` | `{ partType: string }` | Player clicks a part item |
| `game:partPlaced` | `{ partId: string, partType: string, x: number, y: number, rotation: number }` | Valid placement executed |
| `game:placementFailed` | `{ reason: 'out_of_bounds' \| 'cell_occupied' \| 'invalid_position' \| 'no_remaining' }` | Invalid placement attempted |
| `game:undone` | `{ partId: string }` | Undo command executed |
| `game:modelCompleted` | `{ modelId: string, score: number, elapsedMs: number }` | All required parts placed |
| `game:progressSaved` | `{ modelId: string, timestamp: number }` | Auto-save completed |

---

### Screen 3: Results Screen (`#screen-results`)

**Activated when**: `game:modelCompleted` is received.

#### Required DOM elements

| Selector | Role |
|----------|------|
| `#screen-results` | Root container (`<section>`) |
| `#results-score` | Displays final score |
| `#results-time` | Displays completion time `MM:SS` |
| `#results-best-score` | Displays historical best score for this model |
| `.achievement-badge[data-achievement-id]` | One badge per achievement (locked/unlocked state via `.unlocked` class) |
| `button[data-action="replay"]` | Restart same model |
| `button[data-action="menu"]` | Return to model selection |

#### Events emitted

| Event | `detail` shape | When |
|-------|---------------|------|
| `game:replayRequested` | `{ modelId: string }` | Player clicks replay |
| `game:menuRequested` | `{}` | Player clicks menu |

---

## Persistence API Contract

The game's persistence layer (`StorageService`) exposes the following interface. Implementations must satisfy this contract for unit testability (can be mocked in tests).

```typescript
interface StorageService {
  // Save build progress for a model; overwrites existing
  saveProgress(progress: BuildProgress): void;

  // Load progress for a model; returns null if no save or validation fails
  loadProgress(modelId: string): BuildProgress | null;

  // Clear progress for a model (e.g., after replay)
  clearProgress(modelId: string): void;

  // Save/load best score records
  saveScoreRecord(record: ScoreRecord): void;
  loadScoreRecord(modelId: string): ScoreRecord | null;

  // Load all score records (for model selection screen status)
  loadAllScoreRecords(): ScoreRecord[];
}
```

**localStorage key convention**:
- Progress: `game_progress_<modelId>`
- Scores: `game_scores_<modelId>`

---

## Game Engine API Contract

The `GameEngine` class coordinates state and is the integration point for all screens. Minimal public API:

```typescript
interface GameEngine {
  // Start a new or resume an existing build for modelId
  startModel(modelId: string): void;

  // Select a part type to place next
  selectPart(partType: string): void;

  // Attempt to place the selected part at (x, y) with current rotation
  placePart(x: number, y: number): PlacementResult;

  // Undo the last placement
  undo(): boolean;

  // Get current game state (read-only snapshot)
  getState(): ReadonlyGameState;
}

type PlacementResult =
  | { success: true; partId: string }
  | { success: false; reason: 'out_of_bounds' | 'cell_occupied' | 'invalid_position' | 'no_remaining' | 'no_part_selected' };
```

---

## Achievement Contract

Achievements are defined declaratively. The engine evaluates them automatically after each `game:modelCompleted` event.

```typescript
interface AchievementDefinition {
  id: string;
  label: string;          // e.g. "初次建造"
  description: string;    // e.g. "完成你的第一個模型！"
  icon: string;           // emoji or SVG path
  condition: AchievementCondition;
}

type AchievementCondition =
  | { type: 'first-completion'; modelId?: string }      // Any model or specific model
  | { type: 'speed-run'; modelId: string; maxMs: number }
  | { type: 'all-models' };
```

**Minimum achievements required (FR-008)**:

| ID | Condition |
|----|-----------|
| `first-build` | First completion of any model |
| `speed-runner` | Complete any model in under 3 minutes |
| `collector` | Complete all 3 base models |
