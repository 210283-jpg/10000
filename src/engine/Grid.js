export class Grid {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.cells = {};
  }

  isValidPosition(x, y) {
    return Number.isInteger(x) && Number.isInteger(y) &&
      x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  getCell(x, y) {
    return this.cells[`${x},${y}`] || null;
  }

  setCell(x, y, data) {
    if (!this.isValidPosition(x, y)) {
      throw new Error(`Invalid position: ${x},${y}`);
    }
    this.cells[`${x},${y}`] = { x, y, ...data };
  }

  clearCell(x, y) {
    delete this.cells[`${x},${y}`];
  }

  toJSON() {
    return {
      width: this.width,
      height: this.height,
      cells: { ...this.cells }
    };
  }

  static fromJSON(json) {
    const grid = new Grid(json.width, json.height);
    grid.cells = { ...json.cells };
    return grid;
  }
}
