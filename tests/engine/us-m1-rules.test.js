import { describe, it, expect } from 'vitest';
import { createGame, applyMove } from '../../src/engine.js';

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

describe('CA-M-02 — turn alternation', () => {
  it('flips the turn after a legal placement', () => {
    const state = createGame('classic');
    const next = applyMove(state, { type: 'place', player: 'X', cell: 0 });
    expect(next.turn).toBe('O');
  });
});

describe('CA-M-03 — legal placement', () => {
  it('fills the target cell and increments piecesPlaced', () => {
    const state = createGame('classic');
    const next = applyMove(state, { type: 'place', player: 'X', cell: 4 });
    expect(next.board[4]).toBe('X');
    expect(next.piecesPlaced).toBe(1);
  });
});

describe('CA-M-05 — illegal: wrong turn', () => {
  it('rejects a move from the player who is not the turn holder', () => {
    const state = createGame('classic');
    const result = applyMove(state, { type: 'place', player: 'O', cell: 0 });
    expect(result).toEqual({ error: true, reason: 'wrong_turn' });
    expect(state).toEqual(createGame('classic'));
  });
});

describe('CA-M-06 — illegal: game over', () => {
  it('rejects any move once the game has a result', () => {
    const state = { ...createGame('classic'), result: 'X' };
    const frozen = { ...state, board: [...state.board] };
    const result = applyMove(state, { type: 'place', player: 'X', cell: 0 });
    expect(result).toEqual({ error: true, reason: 'game_over' });
    expect(state).toEqual(frozen);
  });
});

describe('CA-M-04 — illegal: occupied cell', () => {
  it('rejects a placement targeting an occupied cell', () => {
    const base = createGame('classic');
    const state = { ...base, board: ['O', ...base.board.slice(1)] };
    const frozen = { ...state, board: [...state.board] };
    const result = applyMove(state, { type: 'place', player: 'X', cell: 0 });
    expect(result).toEqual({ error: true, reason: 'cell_occupied' });
    expect(state).toEqual(frozen);
  });
});
