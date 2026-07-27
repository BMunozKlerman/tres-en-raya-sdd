import { describe, it, expect } from 'vitest';
import { createGame, applyMove } from '../../src/engine.js';

describe('CA-M-15 — placement to movement transition', () => {
  it('switches to movement phase and passes turn to the player who did not place the 6th mark', () => {
    let state = createGame('continuous');
    const sequence = [
      { player: 'X', cell: 0 },
      { player: 'O', cell: 1 },
      { player: 'X', cell: 2 },
      { player: 'O', cell: 3 },
      { player: 'X', cell: 4 },
      { player: 'O', cell: 5 },
    ];
    for (const { player, cell } of sequence) {
      state = applyMove(state, { type: 'place', player, cell });
    }
    expect(state.phase).toBe('movement');
    expect(state.turn).toBe('X');
    expect(state.piecesPlaced).toBe(6);
  });
});
