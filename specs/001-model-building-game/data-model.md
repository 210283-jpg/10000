# Data Model: 模型建構遊戲 (Model Building Game)

**Feature Branch**: `001-model-building-game`  
**Phase**: 1 – Design  
**Date**: 2026-03-13

---

## Entities

### 1. ModelBlueprint（模型藍圖）

Defines a single buildable model – its required parts, valid placement rules, and metadata.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier, e.g. `"house-01"` |
| `name` | `string` | Display name, e.g. `"小屋"` |
| `thumbnail` | `string` | Path to thumbnail image used on selection screen |
| `gridWidth` | `number` | Canvas grid column count (e.g. 10) |
| `gridHeight` | `number` | Canvas grid row count (e.g. 10) |
| `requiredParts` | `Map<string, PartRequirement>` | Part type → requirement spec |
| `description` | `string` | Short description shown on selection screen |

#### PartRequirement (embedded in ModelBlueprint)

| Field | Type | Description |
|-------|------|-------------|
| `quantity` | `number` | How many of this part type the model needs |
| `validPositions` | `'any' \| ValidPosition[]` | `'any'` = free placement; array = constrained cells |

#### ValidPosition (embedded in PartRequirement)

| Field | Type | Description |
|-------|------|-------------|
| `x` | `number` | Grid column (0-based) |
| `y` | `number` | Grid row (0-based) |
| `allowedRotations` | `number[]` | Allowed rotation steps: `[0]`, `[0,1,2,3]`, etc. |

**Validation rules**:
- `id` must be unique across all blueprints.
- `gridWidth` and `gridHeight` must be positive integers.
- `requiredParts` must have at least 8 entries total quantity (per SC-007).
- At least 3 `ModelBlueprint` instances must be registered (per FR-006).

---

### 2. PartDefinition（零件定義）

Static catalog entry for a part type.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `string` | Unique part type key, e.g. `"wall"`, `"roof"`, `"wheel"` |
| `label` | `string` | Display label in parts panel |
| `icon` | `string` | SVG path or emoji used to render the part |
| `color` | `string` | CSS hex color for Canvas rendering |
| `dimensions` | `{ width: number, height: number }` | Cell footprint (1×1 for MVP) |

**Validation rules**:
- `type` must be unique in the catalog.
- `dimensions.width` and `dimensions.height` must be ≥ 1.

---

### 3. Grid（建構格）

Runtime grid state for one active build session.

| Field | Type | Description |
|-------|------|-------------|
| `width` | `number` | Column count (from blueprint) |
| `height` | `number` | Row count (from blueprint) |
| `cells` | `{ [key: string]: Cell }` | Flat dictionary keyed by `"x,y"` |

#### Cell (embedded in Grid)

| Field | Type | Description |
|-------|------|-------------|
| `x` | `number` | Column index |
| `y` | `number` | Row index |
| `occupied` | `boolean` | Whether a part occupies this cell |
| `partId` | `string \| null` | ID of the placed part, or null |
| `partType` | `string \| null` | Type of the placed part, or null |

**State transitions**:
```
Cell(occupied=false) --[placePart]--> Cell(occupied=true, partId, partType)
Cell(occupied=true)  --[removePart]--> Cell(occupied=false, partId=null, partType=null)
```

---

### 4. PlacedPart（已放置零件）

Represents one part instance placed on the grid.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique ID, e.g. `"wall_1710000001234"` |
| `type` | `string` | Part type key (matches `PartDefinition.type`) |
| `x` | `number` | Top-left grid column |
| `y` | `number` | Top-left grid row |
| `rotation` | `number` | Rotation step: 0=0°, 1=90°, 2=180°, 3=270° |

**Validation rules**:
- `x` and `y` must be within `[0, grid.width)` and `[0, grid.height)`.
- All cells occupied by the part must be unoccupied before placement.
- `type` must exist in `PartDefinition` catalog.

---

### 5. BuildProgress（建構進度）

Persisted save state for one in-progress (or completed) build session.

| Field | Type | Description |
|-------|------|-------------|
| `version` | `number` | Save format version (current: 1) |
| `timestamp` | `number` | Unix ms timestamp of last save |
| `modelId` | `string` | Blueprint ID being built |
| `gridWidth` | `number` | Snapshot of grid width |
| `gridHeight` | `number` | Snapshot of grid height |
| `placedParts` | `PlacedPart[]` | All parts placed so far |
| `score` | `number` | Running score (0 until completion) |
| `elapsedMs` | `number` | Elapsed build time in milliseconds |
| `achievements` | `string[]` | IDs of unlocked achievements |

**Validation rules**:
- On load: `version` must match current save version; if mismatch → run migration or discard.
- `modelId` must correspond to a registered `ModelBlueprint`.
- `placedParts` positions must be within grid bounds and non-overlapping.

**localStorage key pattern**: `game_progress_<modelId>`  
**Persistence**: Auto-saved after every part placement / removal.

---

### 6. ScoreRecord（得分記錄）

| Field | Type | Description |
|-------|------|-------------|
| `modelId` | `string` | Blueprint ID |
| `bestScore` | `number` | Highest score ever achieved for this model |
| `bestTimeMs` | `number` | Shortest completion time in ms |
| `completionCount` | `number` | How many times model was fully completed |
| `lastCompletedAt` | `number \| null` | Unix ms timestamp of most recent completion |

**localStorage key pattern**: `game_scores_<modelId>`

---

### 7. Achievement（成就）

Static definition of an achievement.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique ID, e.g. `"first-build"` |
| `label` | `string` | Display name |
| `description` | `string` | Unlock condition description |
| `icon` | `string` | Emoji or SVG icon |
| `condition` | `AchievementCondition` | Programmatic unlock condition |

#### AchievementCondition (type union)

```
{ type: 'first-completion', modelId?: string }       // Complete any/specific model first time
{ type: 'speed-run', modelId: string, maxMs: number } // Complete model under time limit
{ type: 'all-models' }                               // Complete all available models
```

**Persistence**: Achievement unlock status is embedded in `BuildProgress.achievements[]` and `ScoreRecord`.

---

## Relationships

```
ModelBlueprint 1──* PartRequirement
PartRequirement *──1 PartDefinition (by type key)
ModelBlueprint 1──1 Grid (at runtime)
Grid 1──* Cell
PlacedPart *──1 Grid (placed within)
BuildProgress 1──1 ModelBlueprint (by modelId)
BuildProgress 1──* PlacedPart
ScoreRecord 1──1 ModelBlueprint (by modelId)
Achievement *──* ScoreRecord (via unlocked IDs)
```

---

## State Transitions (Game Session)

```
[Model Selection]
    │ playerSelectsModel(modelId)
    ▼
[Build Session – Idle]
    │ playerSelectsPart(type)
    ▼
[Build Session – Part Selected]
    │ playerClicksCell(x, y)  ──[invalid]──► [Build Session – Idle] + show error
    │ [valid]
    ▼
[Part Placed]  ──► auto-save BuildProgress
    │ modelComplete?
    ├─ No  ──► [Build Session – Idle]
    └─ Yes ──► calculate score, unlock achievements, persist ScoreRecord
                ▼
          [Results Screen]
               │ playerClicksReplay / playerClicksMenu
               ▼
         [Model Selection] / [Build Session – Idle, reset grid]
```

---

## Seed Data (Minimum 3 Models, FR-006 / SC-007)

| Model ID | Name (Chinese) | Grid | Total Parts |
|----------|---------------|------|-------------|
| `house-01` | 小屋 | 8×8 | 10 parts (wall×4, roof×2, door×1, window×2, floor×1) |
| `car-01` | 小汽車 | 6×6 | 9 parts (body×1, roof×1, wheel×4, window×2, bumper×1) |
| `robot-01` | 機器人 | 8×10 | 12 parts (head×1, body×1, arm×2, leg×2, hand×2, foot×2, eye×2) |
