import { describe, it, expect, vi } from 'vitest';
import { CommandStack } from '../../src/engine/CommandStack.js';

function makeCmd(executeFn = vi.fn(), undoFn = vi.fn()) {
  return { execute: executeFn, undo: undoFn };
}

describe('CommandStack', () => {
  it('execute calls cmd.execute() and pushes to stack', () => {
    const stack = new CommandStack();
    const cmd = makeCmd();
    stack.execute(cmd);
    expect(cmd.execute).toHaveBeenCalledOnce();
  });

  it('undo calls cmd.undo() on top entry', () => {
    const stack = new CommandStack();
    const cmd = makeCmd();
    stack.execute(cmd);
    const result = stack.undo();
    expect(result).toBe(true);
    expect(cmd.undo).toHaveBeenCalledOnce();
  });

  it('undo on empty stack returns false', () => {
    const stack = new CommandStack();
    expect(stack.undo()).toBe(false);
  });

  it('stack depth capped at 50 — oldest entry dropped on overflow', () => {
    const stack = new CommandStack();
    const cmds = [];
    for (let i = 0; i < 55; i++) {
      const cmd = makeCmd();
      cmds.push(cmd);
      stack.execute(cmd);
    }
    // stack should hold only last 50
    expect(stack.size()).toBe(50);
  });

  it('clear empties the stack', () => {
    const stack = new CommandStack();
    stack.execute(makeCmd());
    stack.execute(makeCmd());
    stack.clear();
    expect(stack.size()).toBe(0);
    expect(stack.undo()).toBe(false);
  });
});
