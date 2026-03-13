import { describe, it, expect, vi } from 'vitest';
import { CommandStack } from '../../src/engine/CommandStack.js';

describe('CommandStack', () => {
  it('execute calls cmd.execute() and pushes to stack', () => {
    const stack = new CommandStack();
    const cmd = { execute: vi.fn(), undo: vi.fn() };
    stack.execute(cmd);
    expect(cmd.execute).toHaveBeenCalledOnce();
  });

  it('undo calls cmd.undo() on top entry', () => {
    const stack = new CommandStack();
    const cmd = { execute: vi.fn(), undo: vi.fn() };
    stack.execute(cmd);
    const result = stack.undo();
    expect(result).toBe(true);
    expect(cmd.undo).toHaveBeenCalledOnce();
  });

  it('undo on empty stack returns false', () => {
    const stack = new CommandStack();
    expect(stack.undo()).toBe(false);
  });

  it('stack depth capped at 50, oldest entry dropped on overflow', () => {
    const stack = new CommandStack();
    for (let i = 0; i < 55; i++) {
      stack.execute({ execute: vi.fn(), undo: vi.fn() });
    }
    // Can undo 50 times
    let count = 0;
    while (stack.undo()) count++;
    expect(count).toBe(50);
  });

  it('clear empties the stack', () => {
    const stack = new CommandStack();
    stack.execute({ execute: vi.fn(), undo: vi.fn() });
    stack.clear();
    expect(stack.undo()).toBe(false);
  });
});
