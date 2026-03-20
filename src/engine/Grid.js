/**
 * Grid — flat-dict representation of the build canvas cells.
 */
export class Grid {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    /** @type {{ [key: string]: { x: number, y: number, occupied: boolean, partId: string|null, partType: string|null } }} */
    this.cells = {};
  }

  _key(x, y) {
    return `${x},${y}`;
  }

  getCell(x, y) {
    const key = this._key(x, y);
    if (!this.cells[key]) {
      this.cells[key] = { x, y, occupied: false, partId: null, partType: null };
    }
    return this.cells[key];
  }

  isValidPosition(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  setCell(x, y, partId, partType) {
    const cell = this.getCell(x, y);
    if (cell.occupied) {
      throw new Error(`Cell (${x},${y}) is already occupied by ${cell.partId}`);
    }
    cell.occupied = true;
    cell.partId = partId;
    cell.partType = partType;
  }

  clearCell(x, y) {
    const key = this._key(x, y);
    this.cells[key] = { x, y, occupied: false, partId: null, partType: null };
  }

  toJSON() {
    return {
      width: this.width,
      height: this.height,
      cells: { ...this.cells },
    };
  }

  static fromJSON(json) {
    const grid = new Grid(json.width, json.height);
    grid.cells = { ...json.cells };
    return grid;
  }
}
