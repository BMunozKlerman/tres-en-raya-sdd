import { describe, it, expect } from 'vitest';
import { createGame, applyMove } from '../../src/engine.js';

function buildStateWithTwoMarks(line, player) {
  const base = createGame('classic');
  const board = [...base.board];
  board[line[0]] = player;
  board[line[1]] = player;
  return { ...base, board, turn: player, piecesPlaced: 2 };
}

describe('CA-M-12 — win detection all 8 lines', () => {
  const lines = [
    [[0, 1, 2], 'top row'],
    [[3, 4, 5], 'middle row'],
    [[6, 7, 8], 'bottom row'],
    [[0, 3, 6], 'left col'],
    [[1, 4, 7], 'center col'],
    [[2, 5, 8], 'right col'],
    [[0, 4, 8], 'main diag'],
    [[2, 4, 6], 'anti-diag'],
  ];

  it.each(lines)('CA-M-12 — X wins on line %s (%s)', (line) => {
    const state = buildStateWithTwoMarks(line, 'X');
    const next = applyMove(state, { type: 'place', player: 'X', cell: line[2] });
    expect(next.result).toBe('X');
    expect([...next.winningLine].sort((a, b) => a - b)).toEqual([...line].sort((a, b) => a - b));
  });

  it.each([lines[0], lines[3]])('CA-M-12 — O wins on line %s (%s)', (line) => {
    const state = buildStateWithTwoMarks(line, 'O');
    const next = applyMove(state, { type: 'place', player: 'O', cell: line[2] });
    expect(next.result).toBe('O');
    expect([...next.winningLine].sort((a, b) => a - b)).toEqual([...line].sort((a, b) => a - b));
  });

  it('CA-M-12 — winningLine is null on a non-terminal state', () => {
    const state = createGame('classic');
    const next = applyMove(state, { type: 'place', player: 'X', cell: 0 });
    expect(next.result).toBeNull();
    expect(next.winningLine).toBeNull();
  });
});

function playSequence(moves) {
  let state = createGame('classic');
  for (const { player, cell } of moves) {
    state = applyMove(state, { type: 'place', player, cell });
  }
  return state;
}

describe('CA-M-13 — classic draw', () => {
  it('sets result to draw when the ninth placement fills the board with no winner', () => {
    const sequence = [
      { player: 'X', cell: 0 },
      { player: 'O', cell: 4 },
      { player: 'X', cell: 1 },
      { player: 'O', cell: 3 },
      { player: 'X', cell: 5 },
      { player: 'O', cell: 2 },
      { player: 'X', cell: 7 },
      { player: 'O', cell: 8 },
      { player: 'X', cell: 6 },
    ];
    const final = playSequence(sequence);
    expect(final.board).not.toContain(null);
    expect(final.result).toBe('draw');
    expect(final.winningLine).toBeNull();
  });
});

describe('CA-M-14 — win over draw precedence', () => {
  it('sets result to the winning mark, not draw, when the ninth placement both fills the board and completes a line', () => {
    const sequence = [
      { player: 'X', cell: 0 },
      { player: 'O', cell: 3 },
      { player: 'X', cell: 1 },
      { player: 'O', cell: 4 },
      { player: 'X', cell: 5 },
      { player: 'O', cell: 6 },
      { player: 'X', cell: 7 },
      { player: 'O', cell: 8 },
      { player: 'X', cell: 2 },
    ];
    const final = playSequence(sequence);
    expect(final.board).not.toContain(null);
    expect(final.result).toBe('X');
  });
});
