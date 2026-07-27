import { describe, it, expect } from 'vitest';
import { createGame } from '../../src/engine.js';
import { chooseMove } from '../../src/agents.js';

describe('CA-A-02 — simple: move independent of memory', () => {
  it('returns the same move for two different memory values on the same state', () => {
    const state = createGame('classic');
    const memoryA = null;
    const memoryB = { stale: true };
    const decisionA = chooseMove(state, 'simple', memoryA, { random: () => 0 });
    const decisionB = chooseMove(state, 'simple', memoryB, { random: () => 0 });
    expect(decisionA.move).toEqual(decisionB.move);
  });
});
