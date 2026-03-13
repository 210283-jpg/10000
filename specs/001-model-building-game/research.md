# Research: 模型建構遊戲 (Model Building Game)

**Feature Branch**: `001-model-building-game`  
**Phase**: 0 – Research  
**Date**: 2026-03-13

---

## R-001: Frontend Technology Stack

**Decision**: Vanilla JavaScript (ES2022+) + HTML5 Canvas + CSS  
**Rationale**: The game uses a fixed-size 2D grid with modest dimensions (<20×20 cells). Vanilla JS with Canvas provides direct control, zero build tooling, smallest possible bundle, and instant deployment to GitHub Pages without a CI build step. No external game engine is needed given the simple gameplay.  
**Alternatives considered**:
- Phaser.js 3 – Excellent grid support and built-in animation system, but adds ~400 KB; overkill for a placement puzzle with simple 2D sprites.  
- Kaboom.js – Lighter but less mature; limited docs compared to Phaser.  
- SVG-based rendering – CSS-animated SVG elements would be more accessible but degrades on grids beyond ~200 cells due to DOM overhead; also harder to manage piece preview overlays.

---

## R-002: Save / Restore Game State

**Decision**: Versioned JSON object stored in `localStorage` with validation on load; per-model save slot keyed by model ID  
**Rationale**: `localStorage` is universal, synchronous, and sufficient for a typical game save (well under 5 MB for any reasonable grid state). Versioning protects against data migration issues. Separate save slots per model let players switch models without losing progress.  
**Alternatives considered**:
- IndexedDB – Asynchronous, more complex API; only worthwhile for large grids (100×100+) or binary assets. Overkill here.  
- sessionStorage – Lost on tab close; does not satisfy FR-005 (persistent progress).  
- Cookies – Size limit of 4 KB; unsuitable for grid state.

**Save format (versioned)**:
```json
{
  "version": 1,
  "timestamp": 1710000000000,
  "modelId": "house-01",
  "gridWidth": 10,
  "gridHeight": 10,
  "placedParts": [
    { "id": "part_1710000001", "type": "wall", "x": 2, "y": 3, "rotation": 0 }
  ],
  "score": 120,
  "elapsedMs": 45000,
  "achievements": ["first-build"]
}
```

---

## R-003: Single-Page Application Architecture

**Decision**: Vanilla JS ScreenManager + single GameState object; no framework  
**Rationale**: The game has three distinct screens (model selection, build canvas, results). A lightweight ScreenManager that shows/hides `<section>` elements avoids the overhead of a router library. A single top-level `GameState` object is the single source of truth.  
**Alternatives considered**:
- React/Vue SPA – Adds build tooling; overkill for 3 screens.  
- Hash-based routing library – Unnecessary complexity for an entirely offline game.

**Screen structure**:
```
ScreenManager
├── ModelSelectionScreen   – thumbnail grid of available models
├── BuildScreen            – parts panel + grid canvas + HUD
└── ResultsScreen          – score, time, achievements, replay
```

---

## R-004: Undo / Redo

**Decision**: Command Pattern with a bounded undo stack (max 50 commands)  
**Rationale**: The Command pattern cleanly encapsulates `execute()` / `undo()` for each part placement. Only `PlacePieceCommand` is needed for MVP; the bounded stack prevents unbounded memory growth.  
**Alternatives considered**:
- Full state snapshot (Memento) – Copies the entire grid every action; too much memory for grids ≥10×10 with many parts.  
- Linear action log + replay – Correct but slow to reconstruct state from scratch on every undo.

---

## R-005: Testing Strategy

**Decision**: Vitest (unit + integration, jsdom environment) + Playwright (E2E)  
**Rationale**: Vitest is Jest-compatible, runs in the browser's ESM module system without transpilation, and integrates seamlessly with jsdom for DOM testing. Playwright is used for E2E flow tests and GitHub Pages smoke tests. Canvas rendering is NOT directly tested—tests focus on data model and state logic.  
**Alternatives considered**:
- Jest + jsdom – Works well but requires babel/transpilation for native ES modules; Vitest is the modern successor.  
- Cypress – Slower, requires a server; Playwright is faster and server-less for static HTML.

---

## R-006: Grid Representation

**Decision**: Flat object dictionary `{ "x,y": Cell }` as the canonical grid; `x` = column, `y` = row  
**Rationale**: Dictionary lookup `O(1)` by key, easy to serialize to JSON, avoids 2D array index confusion. Cells store `{ occupied: bool, partId: string|null, partType: string|null }`.  
**Alternatives considered**:
- 2D array `grid[y][x]` – Intuitive but harder to serialize and prone to row/column confusion.  
- Flat 1D array with `index = y * width + x` – Compact but less readable in JSON.

---

## R-007: Part Placement Rules

**Decision**: Each `ModelBlueprint` declares `requiredParts` as a Map from part type → `{ quantity, validPositions }`. `validPositions` is either `'any'` (free placement) or an array of `{ x, y, allowedRotations[] }` cells.  
**Rationale**: Declarative blueprint data keeps placement rules out of engine code, making it easy to add new models by writing data rather than code. Supports both constrained (puzzle-style) and free-form placement.  
**Alternatives considered**:
- Procedural validation per-model – Hard-coded if/else chains per model; not scalable.  
- Bitfield mask per model – Compact but opaque; hard to author and debug.
