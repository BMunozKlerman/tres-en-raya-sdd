import { describe, it, expect } from 'vitest';
import { applyMove } from '../../src/engine.js';

describe('CA-M-18 — illegal: empty source cell', () => {
  it('rejects a movement action whose source cell is empty', () => {
    const state = {
      board: ['X', 'O', 'X', 'O', 'X', 'O', null, null, null],
      turn: 'X',
      mode: 'continuous',
      phase: 'movement',
      piecesPlaced: 6,
      result: null,
    };
    const frozen = { ...state, board: [...state.board] };
    const result = applyMove(state, { type: 'move', player: 'X', from: 6, to: 7 });
    expect(result).toEqual({ error: true, reason: 'no_mark_at_source' });
    expect(state).toEqual(frozen);
  });
});

describe('CA-M-19 — illegal: occupied destination', () => {
  it('rejects a movement action whose destination cell is occupied', () => {
    const state = {
      board: ['X', 'O', 'X', 'O', 'X', 'O', null, null, null],
      turn: 'X',
      mode: 'continuous',
      phase: 'movement',
      piecesPlaced: 6,
      result: null,
    };
    const frozen = { ...state, board: [...state.board] };
    const result = applyMove(state, { type: 'move', player: 'X', from: 0, to: 1 });
    expect(result).toEqual({ error: true, reason: 'cell_occupied' });
    expect(state).toEqual(frozen);
  });
});
