import { describe, it, expect } from 'vitest';
import { createGame, applyMove, legalMoves } from '../../src/engine.js';

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

describe('CA-M-08 — illegal: wrong phase', () => {
  it('rejects a movement action during the placement phase', () => {
    const state = createGame('classic');
    const frozen = { ...state, board: [...state.board] };
    const result = applyMove(state, { type: 'move', player: 'X', from: 0, to: 1 });
    expect(result).toEqual({ error: true, reason: 'wrong_phase' });
    expect(state).toEqual(frozen);
  });
});

describe('CA-M-20 — illegal: placement during movement phase', () => {
  it('rejects a placement action during the movement phase', () => {
    const state = {
      board: ['X', 'O', null, 'O', 'X', 'O', null, null, 'X'],
      turn: 'X',
      mode: 'continuous',
      phase: 'movement',
      piecesPlaced: 6,
      result: null,
    };
    const frozen = { ...state, board: [...state.board] };
    const result = applyMove(state, { type: 'place', player: 'X', cell: 6 });
    expect(result).toEqual({ error: true, reason: 'wrong_phase' });
    expect(state).toEqual(frozen);
  });
});

describe('CA-M-09 — legalMoves in placement phase', () => {
  it('returns one placement action for each null cell', () => {
    const state = createGame('classic');
    const moves = legalMoves(state);
    expect(moves).toHaveLength(9);
    for (let i = 0; i < 9; i += 1) {
      expect(moves).toContainEqual({ type: 'place', cell: i });
    }
  });

  it('excludes cells that are already occupied', () => {
    const base = createGame('classic');
    const state = { ...base, board: ['X', ...base.board.slice(1)] };
    const moves = legalMoves(state);
    expect(moves).toHaveLength(8);
    expect(moves).not.toContainEqual({ type: 'place', cell: 0 });
  });
});

describe('CA-M-11 — legalMoves after game over', () => {
  it('returns an empty list once the game has a result', () => {
    const state = { ...createGame('classic'), result: 'X' };
    expect(legalMoves(state)).toEqual([]);
  });
});

describe('CA-M-10 — legalMoves in movement phase', () => {
  it('returns one movement action for each own-mark/empty-cell combination', () => {
    const state = {
      board: ['X', 'O', 'X', 'O', 'X', 'O', null, null, null],
      turn: 'X',
      mode: 'continuous',
      phase: 'movement',
      piecesPlaced: 6,
      result: null,
    };
    const moves = legalMoves(state);
    expect(moves).toHaveLength(9);
    for (const from of [0, 2, 4]) {
      for (const to of [6, 7, 8]) {
        expect(moves).toContainEqual({ type: 'move', from, to });
      }
    }
  });
});

describe('CA-M-07 — illegal: opponent mark', () => {
  it('rejects a movement action whose source cell holds the other player\'s mark', () => {
    const state = {
      board: ['X', 'O', 'X', 'O', 'X', 'O', null, null, null],
      turn: 'X',
      mode: 'continuous',
      phase: 'movement',
      piecesPlaced: 6,
      result: null,
    };
    const frozen = { ...state, board: [...state.board] };
    const result = applyMove(state, { type: 'move', player: 'X', from: 1, to: 6 });
    expect(result).toEqual({ error: true, reason: 'not_own_mark' });
    expect(state).toEqual(frozen);
  });
});
