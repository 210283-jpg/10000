const MAX_STACK = 50;

export class CommandStack {
  constructor() {
    this._stack = [];
  }

  execute(command) {
    command.execute();
    this._stack.push(command);
    if (this._stack.length > MAX_STACK) {
      this._stack.shift();
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
}

export class PlacePieceCommand {
  constructor(grid, gameState, placedPart) {
    this.grid = grid;
    this.gameState = gameState;
    this.placedPart = placedPart;
  }

  execute() {
    this.grid.setCell(this.placedPart.x, this.placedPart.y, this.placedPart.id, this.placedPart.type);
    this.gameState.addPart(this.placedPart);
  }

  undo() {
    this.grid.clearCell(this.placedPart.x, this.placedPart.y);
    this.gameState.removePart(this.placedPart.id);
  }
}
