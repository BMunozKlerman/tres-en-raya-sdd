import { describe, it, expect } from 'vitest';
import { chooseMove } from '../../src/agents.js';

const classicInitial = {
  board: Array(9).fill(null),
  turn: 'X',
  mode: 'classic',
  phase: 'placement',
  piecesPlaced: 0,
  result: null,
};

const continuousMaximalBranching = {
  board: ['O', 'X', null, 'O', 'X', null, null, 'O', 'X'],
  turn: 'X',
  mode: 'continuous',
  phase: 'movement',
  piecesPlaced: 6,
  result: null,
};

const positions = [
  ['classic initial board', classicInitial],
  ['continuous maximal-branching movement position', continuousMaximalBranching],
];

const levels = ['simple', 'medium', 'complex'];

describe('CA-N-01 — worst-case response time under 1000 ms', () => {
  for (const [label, state] of positions) {
    for (const level of levels) {
      it(`resolves ${label} in under 1000 ms at the ${level} level`, () => {
        const memory = level === 'complex' ? {} : null;
        const start = performance.now();
        chooseMove(state, level, memory);
        const elapsed = performance.now() - start;
        expect(elapsed).toBeLessThan(1000);
      });
    }
  }
});
