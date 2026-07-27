import { describe, it, expect } from 'vitest';
import { createGame } from '../../src/engine.js';

describe('CA-M-01 — initial state', () => {
  it('returns the correct initial state for classic mode', () => {
    const state = createGame('classic');
    expect(state.board).toEqual(Array(9).fill(null));
    expect(state.turn).toBe('X');
    expect(state.mode).toBe('classic');
    expect(state.phase).toBe('placement');
    expect(state.piecesPlaced).toBe(0);
    expect(state.result).toBeNull();
  });

  it('returns the correct initial state for continuous mode', () => {
    const state = createGame('continuous');
    expect(state.board).toEqual(Array(9).fill(null));
    expect(state.turn).toBe('X');
    expect(state.mode).toBe('continuous');
    expect(state.phase).toBe('placement');
    expect(state.piecesPlaced).toBe(0);
    expect(state.result).toBeNull();
  });
});
