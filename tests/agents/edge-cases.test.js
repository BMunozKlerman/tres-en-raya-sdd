import { describe, it, expect } from 'vitest';
import { applyMove } from '../../src/engine.js';
import { chooseMove } from '../../src/agents.js';

describe('CA-A-15 — medium prefers winning over blocking', () => {
  it('returns the winning move when both a win and a block are available', () => {
    const state = {
      board: ['X', 'X', null, null, null, null, 'O', 'O', null],
      turn: 'X',
      mode: 'classic',
      phase: 'placement',
      piecesPlaced: 4,
      result: null,
    };
    const decision = chooseMove(state, 'medium', null);
    const next = applyMove(state, { type: 'place', player: 'X', cell: decision.move.cell });
    expect(next.result).toBe('X');
  });
});

describe('CA-A-16 — medium blocks one of two simultaneous threats', () => {
  it('returns a move that blocks at least one of the opponent threats', () => {
    const state = {
      board: [null, null, null, null, 'O', 'O', 'O', 'O', null],
      turn: 'X',
      mode: 'classic',
      phase: 'placement',
      piecesPlaced: 4,
      result: null,
    };
    const emptyCells = state.board
      .map((cell, i) => (cell === null ? i : null))
      .filter((i) => i !== null);
    const threatCells = emptyCells.filter((cell) => {
      const reply = applyMove({ ...state, turn: 'O' }, { type: 'place', player: 'O', cell });
      return reply.result === 'O';
    });
    expect(threatCells.length).toBeGreaterThanOrEqual(2);

    const decision = chooseMove(state, 'medium', null);
    expect(threatCells).toContain(decision.move.cell);
  });
});

describe('CA-A-14 — single legal move returned at every level', () => {
  it('returns the only legal move for simple, medium, and complex', () => {
    const state = {
      board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', null],
      turn: 'X',
      mode: 'classic',
      phase: 'placement',
      piecesPlaced: 8,
      result: null,
    };
    const expectedMove = { type: 'place', cell: 8 };

    expect(chooseMove(state, 'simple', null).move).toEqual(expectedMove);
    expect(chooseMove(state, 'medium', null).move).toEqual(expectedMove);
    expect(chooseMove(state, 'complex', {}).move).toEqual(expectedMove);
  });
});
