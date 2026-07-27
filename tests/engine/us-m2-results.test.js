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
  });

  it.each([lines[0], lines[3]])('CA-M-12 — O wins on line %s (%s)', (line) => {
    const state = buildStateWithTwoMarks(line, 'O');
    const next = applyMove(state, { type: 'place', player: 'O', cell: line[2] });
    expect(next.result).toBe('O');
  });
});
