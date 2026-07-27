import { describe, it, expect } from 'vitest';
import { createGame, applyMove } from '../../src/engine.js';
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

describe('CA-A-04 — medium: wins this turn when possible', () => {
  it('returns the move that completes a winning line for the current player', () => {
    const state = {
      board: ['O', 'O', null, null, null, null, 'X', 'X', null],
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

describe('CA-A-05 — medium: blocks a single next-turn threat', () => {
  it('returns a move after which no legal opponent move sets the result to the opponent', () => {
    const state = {
      board: [null, null, null, null, null, null, 'O', 'O', null],
      turn: 'X',
      mode: 'classic',
      phase: 'placement',
      piecesPlaced: 2,
      result: null,
    };
    const decision = chooseMove(state, 'medium', null);
    const afterX = applyMove(state, { type: 'place', player: 'X', cell: decision.move.cell });
    const opponentReplies = afterX.board
      .map((cell, i) => (cell === null ? i : null))
      .filter((i) => i !== null)
      .map((cell) => applyMove(afterX, { type: 'place', player: afterX.turn, cell }));
    expect(opponentReplies.some((reply) => reply.result === 'O')).toBe(false);
  });
});
