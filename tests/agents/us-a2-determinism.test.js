import { describe, it, expect } from 'vitest';
import { createGame } from '../../src/engine.js';
import { chooseMove } from '../../src/agents.js';

describe('CA-A-11 — medium: repeats its own decision', () => {
  it('returns the same move for two calls with the same state and memory', () => {
    const state = createGame('classic');
    const memory = null;
    const first = chooseMove(state, 'medium', memory);
    const second = chooseMove(state, 'medium', memory);
    expect(first.move).toEqual(second.move);
  });
});

describe('CA-A-12 — complex: repeats its own decision', () => {
  it('returns the same move for two calls with the same state and memory', () => {
    const state = createGame('classic');
    const memory = {};
    const first = chooseMove(state, 'complex', memory);
    const second = chooseMove(state, 'complex', memory);
    expect(first.move).toEqual(second.move);
  });
});
