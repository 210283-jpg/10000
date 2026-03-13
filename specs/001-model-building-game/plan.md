# Implementation Plan: 模型建構遊戲 (Model Building Game)

**Branch**: `001-model-building-game` | **Date**: 2026-03-13 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-model-building-game/spec.md`

## Summary

A browser-based 2D grid model-building puzzle game deployable to GitHub Pages as a static site. Players select from 3+ models (小屋, 小汽車, 機器人), place parts on a grid canvas, and earn scores/achievements on completion. Progress is auto-saved to `localStorage`. Implemented in Vanilla JS + HTML5 Canvas with Vitest (unit) + Playwright (E2E) testing.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES2022), HTML5, CSS3  
**Primary Dependencies**: Vitest (unit tests), Playwright (E2E); no runtime dependencies  
**Storage**: `localStorage` – versioned JSON per model (`game_progress_<modelId>`, `game_scores_<modelId>`)  
**Testing**: Vitest + jsdom (unit/integration), Playwright (E2E)  
**Target Platform**: Modern browsers – Chrome/Edge/Firefox (last 2 major versions); GitHub Pages static hosting  
**Project Type**: browser game / single-page static web application  
**Performance Goals**: Visual update within 200 ms of placement (SC-003); page load < 3 s (SC-005); progress restore < 5 s (SC-004)  
**Constraints**: No backend server; offline-capable; localStorage only; no IE support  
**Scale/Scope**: 3 models × ≥8 parts each; 3 screens; ~500–800 lines of source JS

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Check

- [x] **簡潔優先**：本計畫只採最小必要設計（Vanilla JS + Canvas）；無未被需求證明的額外抽象。未使用遊戲引擎、無後端、無框架。
- [x] **文件節制**：僅建立必要的規格文件（spec.md, plan.md, research.md, data-model.md, quickstart.md, contracts/）；未新增僅用於變更總結的 Markdown。
- [x] **TDD**：quickstart.md 中定義了先測試後實作的流程；tasks.md 中每個功能單元將先定義失敗測試再實作。
- [x] **Git 健康檢查**：quickstart.md 定義了三個 checkpoint（spec-001, plan-001, impl-001）；tasks.md 實作階段必須在各任務開始前驗證 `git status` 與 `git branch --show-current`。
- [x] **Implement 保護**：本計畫明確要求 tasks.md 勾選反映真實進度，且禁止 implement 階段覆蓋 spec.md / plan.md / tasks.md。
- [x] **網站專案預設**：本計畫以可部署 GitHub Pages 的靜態前端網站為唯一交付目標（無後端）。

### Post-Design Re-check

- [x] **簡潔優先**：data-model.md 採最小必要實體（7個）；contracts/ 只定義驅動實作所需的 DOM 結構與事件契約；無多餘抽象。
- [x] **文件節制**：所有新文件均為本功能實作所必需，無重複或冗餘文件。
- [x] **TDD**：contracts/ 中明確定義可測試的事件與 API 介面；quickstart.md 提供首個失敗測試範例（Grid.test.js）。
- [x] **Git 健康檢查**：通過（同上）。
- [x] **Implement 保護**：通過（同上）。
- [x] **網站專案預設**：通過（同上）。

**GATE RESULT**: ✅ 所有項目通過，無違規，可繼續執行。

## Project Structure

### Documentation (this feature)

```text
specs/001-model-building-game/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── ui-contracts.md  # Screen DOM contracts, events, API interfaces
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
index.html             ← single HTML entry point
style.css              ← global styles
src/
├── main.js            ← app bootstrap, ScreenManager init
├── engine/
│   ├── GameEngine.js       ← top-level coordinator (placePart, undo, etc.)
│   ├── Grid.js             ← flat-dict grid state
│   ├── GameState.js        ← mutable game state + serialisation
│   ├── CommandStack.js     ← Command pattern undo/redo (max 50)
│   └── CompletionValidator.js ← checks blueprint completion
├── screens/
│   ├── ModelSelectionScreen.js ← model card grid, status badges
│   ├── BuildScreen.js          ← canvas rendering, parts panel
│   └── ResultsScreen.js        ← score, time, achievement badges
├── services/
│   ├── StorageService.js    ← versioned JSON localStorage CRUD
│   ├── ScoreService.js      ← score calculation & record persistence
│   └── AchievementService.js ← declarative achievement evaluation
└── data/
    ├── blueprints.js        ← house-01, car-01, robot-01 seed data
    ├── parts.js             ← PartDefinition catalog
    └── achievements.js      ← AchievementDefinition list

tests/
├── unit/
│   ├── Grid.test.js
│   ├── GameState.test.js
│   ├── CommandStack.test.js
│   ├── CompletionValidator.test.js
│   ├── StorageService.test.js
│   └── ScoreService.test.js
└── e2e/
    └── gameplay.spec.js     ← Playwright end-to-end tests

package.json
vite.config.js               ← optional, for local dev server only
```

**Structure Decision**: Single-project static web app (Option 1 variant). No backend. All source under `src/`; tests under `tests/`. No build step required for GitHub Pages; `vite` is a dev-only tool for hot reload.

## Complexity Tracking

> No constitution violations identified. All design choices justified by requirements.

| Decision | Why Needed | Simpler Alternative Rejected Because |
|----------|------------|-------------------------------------|
| Command pattern (undo) | FR-010 requires undo of last placement | Direct state mutation would need full grid snapshot per action (high memory) |
| 3 screen modules | Model selection + Build + Results are distinct UX flows | Single-file approach would become unmanageable at 3+ screens with separate state |
| AchievementService | FR-008 requires declarative achievement unlock | Hard-coded if/else per achievement is not scalable and hard to test |
