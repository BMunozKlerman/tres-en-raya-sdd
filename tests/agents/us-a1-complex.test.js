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

describe('CA-A-09 — complex: safe within the search horizon in continuous mode', () => {
  it('returns a move after which no legal opponent reply sets the result to the opponent', () => {
    const state = {
      board: ['X', 'O', null, 'X', 'O', null, 'O', null, 'X'],
      turn: 'X',
      mode: 'continuous',
      phase: 'movement',
      piecesPlaced: 6,
      result: null,
    };
    const decision = chooseMove(state, 'complex', {});
    const afterX = applyMove(state, { ...decision.move, player: state.turn });
    const opponentReplies = legalMoves(afterX).map((move) =>
      applyMove(afterX, { ...move, player: afterX.turn })
    );
    expect(opponentReplies.some((reply) => reply.result === afterX.turn)).toBe(false);
  });
});
