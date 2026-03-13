export class CompletionValidator {
  isPlacementValid(type, x, y, grid, blueprint) {
    if (!grid.isValidPosition(x, y)) return false;
    const cell = grid.getCell(x, y);
    if (cell.occupied) return false;

    const req = blueprint.requiredParts[type];
    if (!req) return false;

    if (req.validPositions !== 'any') {
      const allowed = req.validPositions.some(pos => pos.x === x && pos.y === y);
      if (!allowed) return false;
    }

    return true;
  }

  isComplete(grid, blueprint) {
    const counts = {};
    for (const key in grid.cells) {
      const cell = grid.cells[key];
      if (cell.occupied && cell.partType) {
        counts[cell.partType] = (counts[cell.partType] || 0) + 1;
      }
    }
    for (const [type, req] of Object.entries(blueprint.requiredParts)) {
      if ((counts[type] || 0) < req.quantity) return false;
    }
    return true;
  }
}
