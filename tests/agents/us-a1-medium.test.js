import { describe, it, expect } from 'vitest';
import { createGame } from '../../src/engine.js';
import { chooseMove } from '../../src/agents.js';

describe('CA-A-06 — medium: move independent of prior-game memory', () => {
  it('returns the same move on the initial state of a new game regardless of carried-over memory', () => {
    const state = createGame('classic');
    const carriedOverMemory = { someStalePreviousGameData: true };
    const decisionWithMemory = chooseMove(state, 'medium', carriedOverMemory);
    const decisionWithoutMemory = chooseMove(state, 'medium', null);
    expect(decisionWithMemory.move).toEqual(decisionWithoutMemory.move);
  });
});
