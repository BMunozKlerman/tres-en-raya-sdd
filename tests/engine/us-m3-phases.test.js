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

function reachMovementPhase() {
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
  return state;
}

describe('CA-M-16 — legal movement', () => {
  it('moves the mark from source to destination and flips the turn', () => {
    const state = reachMovementPhase();
    const next = applyMove(state, { type: 'move', player: 'X', from: 0, to: 6 });
    expect(next.board[0]).toBeNull();
    expect(next.board[6]).toBe('X');
    expect(next.turn).toBe('O');
  });

  it('D3 — allows a player to return to the cell it vacated on its previous turn', () => {
    const afterFirstMove = applyMove(reachMovementPhase(), {
      type: 'move',
      player: 'X',
      from: 0,
      to: 6,
    });
    const afterONeutralMove = applyMove(afterFirstMove, {
      type: 'move',
      player: 'O',
      from: 1,
      to: 7,
    });
    const returned = applyMove(afterONeutralMove, {
      type: 'move',
      player: 'X',
      from: 6,
      to: 0,
    });
    expect(returned.error).toBeUndefined();
    expect(returned.board[6]).toBeNull();
    expect(returned.board[0]).toBe('X');
    expect(returned.turn).toBe('O');
  });
});
