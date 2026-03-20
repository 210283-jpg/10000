export class PlacePieceCommand {
  constructor(x, y, partData, placedPart, gameState) {
    this.x = x;
    this.y = y;
    this.partData = partData;
    this.placedPart = placedPart;
    this.gameState = gameState;
  }

  execute() {
    this.gameState.addPart(this.placedPart);
  }

  undo() {
    this.gameState.removePart(this.placedPart.id);
  }
}

export class CommandStack {
  constructor(maxDepth = 50) {
    this.maxDepth = maxDepth;
    this.stack = [];
  }

  execute(cmd) {
    cmd.execute();
    this.stack.push(cmd);
    if (this.stack.length > this.maxDepth) {
      this.stack.shift();
    }
  }

  undo() {
    if (this.stack.length === 0) return false;
    const cmd = this.stack.pop();
    cmd.undo();
    return true;
  }

  clear() {
    this.stack = [];
  }

  get size() {
    return this.stack.length;
  }
}
