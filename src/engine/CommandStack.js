const MAX_STACK_DEPTH = 50;

/**
 * CommandStack — Command pattern undo stack.
 */
export class CommandStack {
  constructor() {
    /** @type {Array<{execute:()=>void, undo:()=>void}>} */
    this._stack = [];
  }

  execute(command) {
    command.execute();
    this._stack.push(command);
    if (this._stack.length > MAX_STACK_DEPTH) {
      this._stack.shift(); // drop oldest
    }
  }

  undo() {
    if (this._stack.length === 0) return false;
    const command = this._stack.pop();
    command.undo();
    return true;
  }

  clear() {
    this._stack = [];
  }

  size() {
    return this._stack.length;
  }
}

/**
 * PlacePieceCommand — places or removes a part on a Grid.
 */
export class PlacePieceCommand {
  constructor(grid, x, y, partId, partType) {
    this.grid = grid;
    this.x = x;
    this.y = y;
    this.partId = partId;
    this.partType = partType;
  }

  execute() {
    this.grid.setCell(this.x, this.y, this.partId, this.partType);
  }

  undo() {
    this.grid.clearCell(this.x, this.y);
  }
}
