import { describe, it, expect } from 'vitest';
import { createGame, applyMove } from '../../src/engine.js';
import { chooseMove } from '../../src/agents.js';

function mulberry32(seed) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function playGame(complexMark, simpleMark, seed) {
  const random = mulberry32(seed);
  let state = createGame('classic');
  let complexMemory = {};

  while (state.result === null) {
    if (state.turn === complexMark) {
      const decision = chooseMove(state, 'complex', complexMemory);
      complexMemory = decision.memory;
      state = applyMove(state, { ...decision.move, player: state.turn });
    } else {
      const decision = chooseMove(state, 'simple', null, { random });
      state = applyMove(state, { ...decision.move, player: state.turn });
    }
  }

  return state.result;
}

describe('CA-A-13 — complex never loses to simple over 20 games', () => {
  it('never ends a game with the simple side as the result', () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      const complexFirst = seed <= 10;
      const complexMark = complexFirst ? 'X' : 'O';
      const simpleMark = complexFirst ? 'O' : 'X';
      const result = playGame(complexMark, simpleMark, seed);
      expect(result).not.toBe(simpleMark);
    }
  });
});
