import { describe, it, expect } from 'vitest';
import { createGame, applyMove, legalMoves } from '../../src/engine.js';
import { chooseMove } from '../../src/agents.js';

describe('CA-A-08 — complex: never loses a classic game', () => {
  it('ends every possible opponent sequence with a result that is never the opponent mark', () => {
    const opponent = 'O';

    function play(state, complexMemory) {
      if (state.result !== null) {
        expect(state.result).not.toBe(opponent);
        return;
      }

      if (state.turn !== opponent) {
        const decision = chooseMove(state, 'complex', complexMemory);
        const next = applyMove(state, { ...decision.move, player: state.turn });
        play(next, decision.memory);
        return;
      }

      for (const move of legalMoves(state)) {
        const next = applyMove(state, { ...move, player: state.turn });
        play(next, complexMemory);
      }
    }

    play(createGame('classic'), {});
  });
});
