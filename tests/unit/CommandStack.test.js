import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommandStack, PlacePieceCommand } from '../../src/engine/CommandStack.js';
import { GameState } from '../../src/engine/GameState.js';

const mockBlueprint = {
  id: 'car-01',
  gridWidth: 6,
  gridHeight: 6,
  requiredParts: { wheel: 4 },
  cells: [
    { x: 0, y: 0, partType: 'wheel' },
    { x: 1, y: 0, partType: 'wheel' },
    { x: 2, y: 0, partType: 'wheel' },
    { x: 3, y: 0, partType: 'wheel' }
  ]
};

function makePart(id, type = 'wheel', x = 0, y = 0) {
  return { id, type, x, y, rotation: 0 };
}

describe('PlacePieceCommand', () => {
  let state;

  beforeEach(() => {
    state = new GameState(mockBlueprint);
  });

  it('execute() adds part to gameState', () => {
    const part = makePart('wheel_1');
    const cmd = new PlacePieceCommand(0, 0, {}, part, state);
    cmd.execute();
    expect(state.placedParts).toHaveLength(1);
  });

  it('undo() removes part from gameState', () => {
    const part = makePart('wheel_1');
    const cmd = new PlacePieceCommand(0, 0, {}, part, state);
    cmd.execute();
    cmd.undo();
    expect(state.placedParts).toHaveLength(0);
  });
});

describe('CommandStack', () => {
  let stack;
  let state;

  beforeEach(() => {
    stack = new CommandStack();
    state = new GameState(mockBlueprint);
  });

  it('starts empty', () => {
    expect(stack.size).toBe(0);
  });

  it('execute(cmd) calls cmd.execute()', () => {
    const cmd = { execute: vi.fn(), undo: vi.fn() };
    stack.execute(cmd);
    expect(cmd.execute).toHaveBeenCalledOnce();
  });

  it('execute(cmd) pushes to stack', () => {
    const cmd = { execute: vi.fn(), undo: vi.fn() };
    stack.execute(cmd);
    expect(stack.size).toBe(1);
  });

  it('undo() calls cmd.undo() on the top entry', () => {
    const cmd = { execute: vi.fn(), undo: vi.fn() };
    stack.execute(cmd);
    stack.undo();
    expect(cmd.undo).toHaveBeenCalledOnce();
  });

  it('undo() returns true when there is something to undo', () => {
    const cmd = { execute: vi.fn(), undo: vi.fn() };
    stack.execute(cmd);
    expect(stack.undo()).toBe(true);
  });

  it('undo() returns false on empty stack', () => {
    expect(stack.undo()).toBe(false);
  });

  it('undo() pops the top entry (stack shrinks)', () => {
    const cmd1 = { execute: vi.fn(), undo: vi.fn() };
    const cmd2 = { execute: vi.fn(), undo: vi.fn() };
    stack.execute(cmd1);
    stack.execute(cmd2);
    stack.undo();
    expect(stack.size).toBe(1);
  });

  it('undo() undoes commands in LIFO order', () => {
    const order = [];
    const cmd1 = { execute: vi.fn(), undo: () => order.push(1) };
    const cmd2 = { execute: vi.fn(), undo: () => order.push(2) };
    stack.execute(cmd1);
    stack.execute(cmd2);
    stack.undo();
    stack.undo();
    expect(order).toEqual([2, 1]);
  });

  it('stack depth is capped at maxDepth (50 default)', () => {
    const cmds = Array.from({ length: 55 }, (_, i) => ({
      execute: vi.fn(),
      undo: vi.fn(),
      _index: i
    }));
    for (const cmd of cmds) stack.execute(cmd);
    expect(stack.size).toBe(50);
  });

  it('oldest entry is dropped when overflow occurs', () => {
    const stack2 = new CommandStack(3);
    const cmds = Array.from({ length: 5 }, (_, i) => ({
      execute: vi.fn(),
      undo: vi.fn(),
      _index: i
    }));
    for (const cmd of cmds) stack2.execute(cmd);
    expect(stack2.size).toBe(3);
  });

  it('clear() empties the stack', () => {
    const cmd = { execute: vi.fn(), undo: vi.fn() };
    stack.execute(cmd);
    stack.clear();
    expect(stack.size).toBe(0);
  });

  it('clear() means undo returns false afterwards', () => {
    const cmd = { execute: vi.fn(), undo: vi.fn() };
    stack.execute(cmd);
    stack.clear();
    expect(stack.undo()).toBe(false);
  });

  describe('integration with PlacePieceCommand', () => {
    it('places then undoes a part', () => {
      const part = makePart('wheel_1', 'wheel', 0, 0);
      const cmd = new PlacePieceCommand(0, 0, {}, part, state);
      stack.execute(cmd);
      expect(state.placedParts).toHaveLength(1);
      stack.undo();
      expect(state.placedParts).toHaveLength(0);
    });
  });
});
