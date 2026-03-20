/**
 * CompletionValidator — validates placements and checks model completion.
 */
export class CompletionValidator {
  /**
   * Returns true if placing partType at (x,y) is valid.
   */
  static isPlacementValid(partType, x, y, grid, blueprint) {
    if (!grid.isValidPosition(x, y)) return false;
    const cell = grid.getCell(x, y);
    if (cell.occupied) return false;

    const req = blueprint.requiredParts[partType];
    if (!req) return false; // part type not needed for this blueprint

    if (req.validPositions === 'any') return true;

    // Constrained: check if (x,y) is in the allowed list
    return req.validPositions.some(pos => pos.x === x && pos.y === y);
  }

  /**
   * Returns true when all required part quantities are satisfied.
   * @param {Array<{type:string}>} placedParts
   * @param {object} blueprint
   */
  static isComplete(placedParts, blueprint) {
    for (const [type, req] of Object.entries(blueprint.requiredParts)) {
      const count = placedParts.filter(p => p.type === type).length;
      if (count < req.quantity) return false;
    }
    return true;
  }
}
