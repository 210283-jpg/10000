# Tasks: 模型建構遊戲 (Model Building Game)

**Input**: Design documents from `/specs/001-model-building-game/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ui-contracts.md ✓, quickstart.md ✓

**Tests**: 依專案憲章 CA-003，測試為必要項目。所有使用者故事 MUST 先建立失敗測試，再進入實作。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure — no source code yet

- [X] T001 Create project directory structure: `src/engine/`, `src/screens/`, `src/services/`, `src/data/`, `tests/unit/`, `tests/e2e/` at repository root
- [X] T002 Initialize npm project and install dependencies in `package.json`: `vitest`, `@vitest/coverage-v8`, `jsdom`, `@playwright/test`, `vite` (dev)
- [X] T003 [P] Configure Vitest with jsdom environment in `vite.config.js` (test.environment: jsdom, test.include: `tests/unit/**/*.test.js`)
- [X] T004 [P] Configure Playwright in `playwright.config.js` (webServer pointing to `npx serve .`, baseURL localhost, tests/e2e dir)
- [X] T005 [P] Create `index.html` with three `<section>` screens: `#screen-model-select`, `#screen-build`, `#screen-results`; link `style.css` and `src/main.js` as ES module
- [X] T006 [P] Create `style.css` with CSS reset, screen visibility utilities (`.hidden`), custom properties (`--cell-size: 48px`), and base layout skeleton
- [X] T00A Record baseline Git state (`git status`, `git branch --show-current`, `git rev-parse --short HEAD`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Static seed data that all user stories need — no engine logic yet

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 [P] Create `src/data/blueprints.js` — export `BLUEPRINTS` array with 3 `ModelBlueprint` objects: `house-01` (8×8 grid, 10 required parts: wall×4, roof×2, door×1, window×2, floor×1), `car-01` (6×6 grid, 9 parts: body×1, roof×1, wheel×4, window×2, bumper×1), `robot-01` (8×10 grid, 12 parts: head×1, body×1, arm×2, leg×2, hand×2, foot×2, eye×2)
- [X] T008 [P] Create `src/data/parts.js` — export `PARTS` map of `PartDefinition` objects for all part types in blueprints (type, label, icon/emoji, color CSS hex, dimensions 1×1)
- [X] T009 [P] Create `src/data/achievements.js` — export `ACHIEVEMENTS` array with 3 `AchievementDefinition` objects: `first-build` (`first-completion`), `speed-runner` (`speed-run`, any model, maxMs: 180000), `collector` (`all-models`)
- [X] T00B Verify seed data loads correctly: open browser console, `import('./src/data/blueprints.js').then(m => console.log(m.BLUEPRINTS.length))` → expect 3

**Checkpoint**: Seed data ready — user story implementation can now begin

---

## Phase 3: User Story 1 - 基礎模型建構 (Priority: P1) 🎯 MVP

**Goal**: Player can select parts from a parts panel and place them on the grid canvas; the game detects completion and shows a feedback message.

**Independent Test**: Open the game page, select any part from the parts panel, click a valid grid cell, confirm the part appears at that position, place all required parts, observe the completion feedback.

### Tests for User Story 1 (MANDATORY) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (`npm test` shows RED)**

- [X] T010 [P] [US1] Write failing `tests/unit/Grid.test.js` — cover: `new Grid(w,h)` initialises all cells unoccupied; `getCell(x,y)` returns correct cell; `isValidPosition` rejects out-of-bounds; `setCell` marks cell occupied with partId/partType; `clearCell` marks unoccupied; duplicate placement throws
- [X] T011 [P] [US1] Write failing `tests/unit/GameState.test.js` — cover: `new GameState(blueprint)` initialises placedParts=[], elapsedMs=0; `addPart` / `removePart` mutate placedParts; `serialize()` / `deserialize()` round-trip produces equal state; `version` field present in serialized output
- [X] T012 [P] [US1] Write failing `tests/unit/CommandStack.test.js` — cover: `execute(cmd)` calls `cmd.execute()` and pushes to stack; `undo()` calls `cmd.undo()` on top entry; `undo()` on empty stack returns false; stack depth capped at 50 (oldest entry dropped on overflow); `clear()` empties stack
- [X] T013 [P] [US1] Write failing `tests/unit/CompletionValidator.test.js` — cover: `isPlacementValid(type,x,y,grid,blueprint)` returns false for occupied cell, out-of-bounds, and part-type with `validPositions` array that excludes `(x,y)`; returns true for valid placement; `isComplete(grid,blueprint)` returns true when all required quantities are met, false otherwise
- [X] T014 [P] [US1] Write failing `tests/e2e/gameplay.spec.js` — US1 scenario: navigate to `index.html`, click `.model-card button[data-action="select"]` on first model, assert `#screen-build` visible; click `.part-item` in `#parts-panel`, assert `.part-item.selected` present; click canvas at first valid cell, assert `game:partPlaced` event received (via `page.evaluate`); place all required parts, assert `game:modelCompleted` event fired

### Implementation for User Story 1

- [X] T015 [P] [US1] Implement `src/engine/Grid.js` — `Grid` class with `width`, `height`, flat-dict `cells` keyed `"x,y"`, methods: `getCell(x,y)`, `setCell(x,y,partId,partType)`, `clearCell(x,y)`, `isValidPosition(x,y)`, `toJSON()` / `fromJSON()`
- [X] T016 [P] [US1] Implement `src/engine/GameState.js` — `GameState` class: stores `modelId`, `grid` (Grid instance), `placedParts` (PlacedPart[]), `selectedPartType`, `elapsedMs`, `score`; methods `addPart(placedPart)`, `removePart(partId)`, `serialize()`, static `deserialize(json, blueprints)`
- [X] T017 [P] [US1] Implement `src/engine/CommandStack.js` — `CommandStack` class: `execute(command)` (calls `command.execute()`, pushes to stack, trims to 50); `undo()` (pops, calls `command.undo()`, returns bool); `clear()`; `PlacePieceCommand` inner class with `execute()` / `undo()` calling grid `setCell` / `clearCell`
- [X] T018 [US1] Implement `src/engine/CompletionValidator.js` — `CompletionValidator` class: `isPlacementValid(type,x,y,grid,blueprint)` checks bounds, occupied, and `validPositions` rules; `isComplete(grid,blueprint)` counts placed parts by type against `requiredParts` quantities
- [X] T019 [US1] Implement `src/engine/GameEngine.js` — `GameEngine` class: `startModel(modelId)` initialises `GameState`, emits no event yet; `selectPart(type)` sets `selectedPartType`; `placePart(x,y)` validates via `CompletionValidator`, executes `PlacePieceCommand`, emits `game:partPlaced` or `game:placementFailed`, checks completion and emits `game:modelCompleted`; `undo()` delegates to `CommandStack`, emits `game:undone`; `getState()` returns read-only snapshot
- [X] T020 [P] [US1] Implement `src/screens/BuildScreen.js` — renders `<canvas id="build-canvas">` grid at `CELL_SIZE=48`, parts panel items (`.part-item[data-part-type]`, `.part-count`, `.part-item.selected`), HUD (`#hud-score`, `#hud-timer`), `#btn-undo`, `#btn-menu`; maps canvas clicks to `GameEngine.placePart(gridX,gridY)`; listens for `game:partPlaced`, `game:placementFailed`, `game:undone`, `game:modelCompleted` to re-render
- [X] T021 [P] [US1] Implement `src/screens/ModelSelectionScreen.js` (US1 MVP) — renders ≥3 `.model-card[data-model-id]` elements with `.model-thumbnail`, `.model-name`, `.model-status` (empty initially), and `button[data-action="select"]`; on click emits `game:modelSelected` with `{ modelId }`
- [X] T022 [US1] Create `src/main.js` — imports `GameEngine`, `ModelSelectionScreen`, `BuildScreen`; shows `#screen-model-select` on load; listens for `game:modelSelected` → `engine.startModel(modelId)`, show `#screen-build`; listens for `game:menuRequested` → show `#screen-model-select`; timer tick every second updating `#hud-timer`
- [X] T023 [US1] Run unit tests (`npm test`) and fix `Grid.js`, `GameState.js`, `CommandStack.js`, `CompletionValidator.js`, `GameEngine.js` until all pass GREEN
- [X] T024 [US1] Run E2E tests (`npm run test:e2e`) — serve app (`npx serve .`), run Playwright US1 scenario, fix `BuildScreen.js` / `ModelSelectionScreen.js` / `main.js` until GREEN
- [X] T02A [US1] Update `specs/001-model-building-game/tasks.md` checkboxes for Phase 3 and record Git state (`git add . && git commit -m "feat(us1): 基礎模型建構完成"`)

**Checkpoint**: US1 fully functional — player can select a model, place parts, see completion message. Test independently.

---

## Phase 4: User Story 2 - 模型選擇與進度管理 (Priority: P2)

**Goal**: Player sees a model catalog with status badges; progress is auto-saved to `localStorage` and restored on page reload.

**Independent Test**: Open game, see ≥3 model cards; select one, place several parts, reload page, confirm build progress is restored and the model card shows "進行中".

### Tests for User Story 2 (MANDATORY) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T025 [P] [US2] Write failing `tests/unit/StorageService.test.js` — cover: `saveProgress(progress)` stores JSON at `game_progress_<modelId>`; `loadProgress(modelId)` returns parsed `BuildProgress` or `null` on missing/corrupt/version-mismatch; `clearProgress(modelId)` removes key; `saveScoreRecord` / `loadScoreRecord` with key `game_scores_<modelId>`; `loadAllScoreRecords()` returns array of all stored records; uses `jsdom` localStorage mock
- [X] T026 [P] [US2] Write failing E2E progress persistence test in `tests/e2e/gameplay.spec.js` — US2 scenario: select model, place 3 parts, reload page, assert `#screen-model-select` shows model card `.model-status` = "進行中"; select same model again, assert `#screen-build` canvas shows 3 previously placed parts

### Implementation for User Story 2

- [X] T027 [US2] Implement `src/services/StorageService.js` — `StorageService` class implementing the contract in `contracts/ui-contracts.md`: `saveProgress(progress)`, `loadProgress(modelId)`, `clearProgress(modelId)`, `saveScoreRecord(record)`, `loadScoreRecord(modelId)`, `loadAllScoreRecords()`; stores versioned JSON; handles `localStorage` quota errors gracefully (console.warn, no crash)
- [X] T028 [US2] Enhance `src/engine/GameEngine.js` to integrate `StorageService`: `startModel` calls `storageService.loadProgress(modelId)` and restores `GameState` if valid; `placePart` and `undo` call `storageService.saveProgress(state.serialize())` after each mutation; emit `game:progressSaved` with `{ modelId, timestamp }`
- [X] T029 [US2] Enhance `src/screens/ModelSelectionScreen.js` — on render call `storageService.loadAllScoreRecords()` and `storageService.loadProgress(modelId)` per model; update `.model-status` badge: no ScoreRecord and no BuildProgress → `""`, BuildProgress exists with `placedParts.length>0` and `completionCount===0` → `"進行中"`, ScoreRecord with `completionCount>0` → `"已完成"`; display all 3 models with thumbnail, name, and correct badge
- [X] T030 [US2] Run unit tests (`npm test`) and fix `StorageService.js` until all pass GREEN
- [X] T031 [US2] Run E2E tests (`npm run test:e2e`) for US2 scenario and fix until GREEN
- [X] T02B [US2] Update `specs/001-model-building-game/tasks.md` checkboxes for Phase 4 and record Git state (`git add . && git commit -m "feat(us2): 模型選擇與進度管理完成"`)

**Checkpoint**: US1 AND US2 independently functional — progress persists across reloads.

---

## Phase 5: User Story 3 - 得分與成就系統 (Priority: P3)

**Goal**: Player earns a score on model completion; best scores and completion times are recorded; achievement badges unlock with animation.

**Independent Test**: Complete a model, confirm score displayed on results screen with best-score comparison; check Achievements page shows correct unlocked/locked badge states.

### Tests for User Story 3 (MANDATORY) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T032 [P] [US3] Write failing `tests/unit/ScoreService.test.js` — cover: `calculateScore(elapsedMs, partsPlaced)` returns higher score for lower time; `updateRecord(modelId, score, elapsedMs)` saves new `ScoreRecord` if score is best or first; `loadRecord(modelId)` returns stored record or null; uses `StorageService` mock
- [X] T033 [P] [US3] Write failing E2E achievements test in `tests/e2e/gameplay.spec.js` — US3 scenario: complete a model (place all required parts), assert `#screen-results` visible; assert `#results-score` text is non-zero; assert `#results-best-score` shown; assert `.achievement-badge[data-achievement-id="first-build"]` has class `.unlocked`; click `button[data-action="menu"]`, assert `#screen-model-select` visible with model card `.model-status` = "已完成"

### Implementation for User Story 3

- [X] T034 [P] [US3] Implement `src/services/ScoreService.js` — `ScoreService` class: `calculateScore(elapsedMs, totalPartsPlaced)` formula (e.g. base 1000 − floor(elapsedMs/1000)); `updateRecord(modelId, score, elapsedMs)` loads existing `ScoreRecord`, updates `bestScore` / `bestTimeMs` / `completionCount` / `lastCompletedAt`, persists via `StorageService.saveScoreRecord`; `loadRecord(modelId)` delegates to `StorageService`
- [X] T035 [P] [US3] Implement `src/services/AchievementService.js` — `AchievementService` class: `evaluateAchievements(modelId, elapsedMs)` loads all score records, checks each `AchievementDefinition.condition`: `first-completion` (any `completionCount ≥ 1`), `speed-run` (elapsed ≤ `maxMs` and completion), `all-models` (all 3 blueprints have `completionCount ≥ 1`); returns array of newly unlocked achievement IDs
- [X] T036 [US3] Implement `src/screens/ResultsScreen.js` — renders `#screen-results` with `#results-score`, `#results-time` (MM:SS), `#results-best-score`; one `.achievement-badge[data-achievement-id]` per achievement (`.unlocked` class on unlocked); `button[data-action="replay"]` emits `game:replayRequested`; `button[data-action="menu"]` emits `game:menuRequested`
- [X] T037 [US3] Integrate `ScoreService` and `AchievementService` into `src/engine/GameEngine.js` — after `isComplete` returns true: call `scoreService.calculateScore`, `scoreService.updateRecord`, `achievementService.evaluateAchievements`, attach `unlockedAchievements` to `game:modelCompleted` event detail `{ modelId, score, elapsedMs, unlockedAchievements }`
- [X] T038 [US3] Wire `ResultsScreen` into `src/main.js` — listen for `game:modelCompleted` → populate and show `#screen-results` via `ResultsScreen.show(detail)`; listen for `game:replayRequested` → `engine.startModel(modelId)` and show `#screen-build`; listen for `game:menuRequested` → show `#screen-model-select`
- [X] T039 [US3] Run unit tests (`npm test`) and fix `ScoreService.js`, `AchievementService.js` until all pass GREEN
- [X] T040 [US3] Run E2E tests (`npm run test:e2e`) for US3 scenario and fix `ResultsScreen.js` / `main.js` integration until GREEN
- [X] T03A [US3] Update `specs/001-model-building-game/tasks.md` checkboxes for Phase 5 and record Git state (`git add . && git commit -m "feat(us3): 得分與成就系統完成"`)

**Checkpoint**: All 3 user stories independently functional. Full gameplay loop complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories — apply only after all stories pass

- [X] T041 [P] Add completion animation (CSS keyframes or Canvas animation) and placement visual feedback (brief highlight) in `style.css` and `src/screens/BuildScreen.js`
- [X] T042 [P] Add achievement unlock animation (badge pop-in effect) in `style.css` and `src/screens/ResultsScreen.js`
- [X] T043 [P] Add edge-case handling: undo on empty stack (silent no-op); `localStorage` quota-exceeded (warn + continue); all models completed → show celebration message in `#screen-model-select`; page-reload mid-build restores correctly (validate in `StorageService.loadProgress`)
- [X] T044 [P] Update `index.html` with proper `<meta charset>`, `<meta name="viewport">`, `<title>模型建構遊戲</title>`, GitHub Pages compatible relative paths
- [X] T045 Run full test suite (`npm test && npm run test:e2e`) — all tests must pass GREEN
- [ ] T046 Manual smoke test per `quickstart.md`: verify SC-003 (part placement visual update within 200 ms), SC-005 (first load < 3 s), SC-004 (progress restore < 5 s), SC-006 (zero-tutorial first completion)
- [X] T047 Create Git checkpoint tag: `git tag impl-001 && git push origin impl-001`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**
- **User Story phases (Phase 3–5)**: All depend on Phase 2 completion
  - Can proceed in priority order (P1 → P2 → P3) or in parallel if staffed
- **Polish (Phase 6)**: Requires all desired user stories complete

### User Story Dependencies

| Story | Depends On | Notes |
|-------|-----------|-------|
| US1 (P1) | Phase 2 only | No dependency on other stories |
| US2 (P2) | Phase 2 + US1 engine (GameEngine exists) | Adds `StorageService` wiring; independently testable |
| US3 (P3) | Phase 2 + US1 engine + US2 StorageService | Reads ScoreRecord from StorageService; independently testable |

### Within Each User Story

1. Write failing tests → confirm RED
2. Implement data layer (Grid / GameState) → confirm unit tests GREEN
3. Implement service layer (GameEngine / StorageService / ScoreService)
4. Implement screen layer (BuildScreen / ModelSelectionScreen / ResultsScreen)
5. Run integration + E2E → confirm GREEN
6. Git checkpoint

---

## Parallel Opportunities

### Phase 1 — can all run in parallel after T001/T002
```
T003 Configure Vitest    ←→   T004 Configure Playwright
T005 Create index.html   ←→   T006 Create style.css
```

### Phase 2 — all three data files in parallel
```
T007 blueprints.js   ←→   T008 parts.js   ←→   T009 achievements.js
```

### Phase 3 (US1) — tests in parallel, then implementations in parallel
```
Tests:  T010 Grid.test.js  ←→  T011 GameState.test.js  ←→  T012 CommandStack.test.js  ←→  T013 CompletionValidator.test.js  ←→  T014 gameplay.spec.js (US1)
Impls:  T015 Grid.js  ←→  T016 GameState.js  ←→  T017 CommandStack.js  (then T018 CompletionValidator, T019 GameEngine, T020 BuildScreen, T021 ModelSelectionScreen)
```

### Phase 4 (US2) — tests in parallel, then implementations in sequence
```
Tests:  T025 StorageService.test.js  ←→  T026 gameplay.spec.js (US2)
Impls:  T027 StorageService.js  →  T028 GameEngine wiring  →  T029 ModelSelectionScreen enhancement
```

### Phase 5 (US3) — tests in parallel, implementations partly parallel
```
Tests:  T032 ScoreService.test.js  ←→  T033 gameplay.spec.js (US3)
Impls:  T034 ScoreService.js  ←→  T035 AchievementService.js  →  T036 ResultsScreen.js  →  T037 GameEngine integration  →  T038 main.js wiring
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (basic build loop)
4. **STOP and VALIDATE**: `npm test && npm run test:e2e` — US1 works end-to-end
5. Deploy to GitHub Pages, share for feedback

### Incremental Delivery

1. Setup + Foundational → project skeleton ready
2. + US1 → MVP: single hardcoded model, place parts, see completion → **Deploy**
3. + US2 → model catalog, progress persistence, status badges → **Deploy**
4. + US3 → score, achievements, results screen → **Deploy**
5. + Polish → animations, edge cases → **Final Deploy**

### Parallel Team Strategy

After Phase 2 completes:
- Developer A: Phase 3 (US1) — engine + build screen
- Developer B: Phase 4 (US2) — storage + model selection (can start after US1 GameEngine.js exists)
- Developer C: Phase 5 (US3) — score + achievements (can start after US2 StorageService.js exists)

---

## Notes

- `[P]` tasks touch different files and have no shared file dependencies — safe to run in parallel
- `[Story]` label maps each task to a user story for traceability
- Each user story is independently completable and testable
- **TDD Red → Green → Refactor**: verify tests fail before implementing, then fix
- Commit after each task or logical group (`git add . && git commit -m "..."`)
- Stop at any checkpoint to validate story independently before continuing
- **Implement 階段禁止刪除或覆蓋 `spec.md`、`plan.md`、`tasks.md`**（CA-005）
- 非使用者明確要求時，不新增僅用於變更總結的 Markdown 檔案（CA-002）
