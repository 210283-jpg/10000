export class CompletionValidator {
  /**
   * Check whether placing partType at (x, y) on grid is valid per blueprint rules.
   */
  isPlacementValid(grid, x, y, partType, blueprint) {
    // Out-of-bounds check
    if (!grid.isValidPosition(x, y)) return false;

    // Already occupied
    const cell = grid.getCell(x, y);
    if (cell && cell.occupied) return false;

    // Must be a cell defined in blueprint
    const blueprintCell = blueprint.cells.find(c => c.x === x && c.y === y);
    if (!blueprintCell) return false;

    // Part type must match the blueprint cell's required type
    if (blueprintCell.partType !== partType) return false;

    return true;
  }

  /**
   * Check whether all required parts have been placed on the grid.
   */
  isComplete(grid, blueprint) {
    // Count placed parts by type
    const counts = {};
    for (const key of Object.keys(grid.cells)) {
      const cell = grid.cells[key];
      if (cell && cell.occupied && cell.partType) {
        counts[cell.partType] = (counts[cell.partType] || 0) + 1;
      }
    }

    // Verify all required parts are satisfied
    for (const [partType, required] of Object.entries(blueprint.requiredParts)) {
      if ((counts[partType] || 0) < required) return false;
    }
    return true;
  }
}
