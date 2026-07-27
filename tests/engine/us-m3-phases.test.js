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
  // reachMovementPhase() yields X:{0,2,4}, O:{1,3,5}, turn X, empty {6,7,8}.
  // Moving X from 0 to 6 would complete the [2,4,6] diagonal (see BUG-002 in
  // docs/bugs.md), so this fixture uses 0->7 instead: X ends at {2,4,7}, which
  // is not one of the 8 fixed winning lines. Verified with a brute-force script
  // (see docs/bugs.md) before writing the assertions below.
  it('moves the mark from source to destination and flips the turn', () => {
    const state = reachMovementPhase();
    const next = applyMove(state, { type: 'move', player: 'X', from: 0, to: 7 });
    expect(next.result).toBeNull();
    expect(next.board[0]).toBeNull();
    expect(next.board[7]).toBe('X');
    expect(next.turn).toBe('O');
  });

  it('D3 — allows a player to return to the cell it vacated on its previous turn', () => {
    // X 0->7 (vacates 0) → O 1->6 (neutral, does not touch cell 0) → X 7->0
    // (returns to the cell X itself vacated on its previous turn). None of the
    // three moves completes a winning line — verified with a brute-force script
    // before writing these assertions (see docs/bugs.md, BUG-002).
    const afterFirstMove = applyMove(reachMovementPhase(), {
      type: 'move',
      player: 'X',
      from: 0,
      to: 7,
    });
    expect(afterFirstMove.result).toBeNull();

    const afterONeutralMove = applyMove(afterFirstMove, {
      type: 'move',
      player: 'O',
      from: 1,
      to: 6,
    });
    expect(afterONeutralMove.result).toBeNull();

    const returned = applyMove(afterONeutralMove, {
      type: 'move',
      player: 'X',
      from: 7,
      to: 0,
    });
    expect(returned.error).toBeUndefined();
    expect(returned.result).toBeNull();
    expect(returned.board[7]).toBeNull();
    expect(returned.board[0]).toBe('X');
    expect(returned.turn).toBe('O');
  });
});

function movementState(board, turn) {
  return {
    board,
    turn,
    mode: 'continuous',
    phase: 'movement',
    piecesPlaced: 6,
    result: null,
  };
}

function ownAndEmptyCells(board, turn) {
  const own = [];
  const empty = [];
  board.forEach((value, i) => {
    if (value === turn) own.push(i);
    if (value === null) empty.push(i);
  });
  return { own, empty };
}

describe('CA-M-17 — no draw in continuous mode', () => {
  // Each board below was verified with a brute-force script (see traceability.md)
  // to confirm that NO legal movement, for either player, completes a winning line —
  // a precondition required for this test to actually exercise the "never draw" property
  // rather than an unreachable "board full" state that this mode cannot produce.
  const safeStates = [
    { label: 'balanced', board: ['X', 'X', 'O', 'O', null, 'X', null, 'O', null], turn: 'X' },
    { label: 'near-win-but-blocked', board: ['X', 'X', 'O', 'O', null, 'X', null, null, 'O'], turn: 'O' },
    { label: 'constrained', board: ['X', 'O', 'X', 'X', null, 'O', 'O', null, null], turn: 'X' },
  ];

  it.each(safeStates)(
    'no legal movement from the $label state ever produces a draw',
    ({ board, turn }) => {
      const state = movementState(board, turn);
      const { own, empty } = ownAndEmptyCells(board, turn);
      expect(own).toHaveLength(3);
      expect(empty).toHaveLength(3);
      for (const from of own) {
        for (const to of empty) {
          const next = applyMove(state, { type: 'move', player: turn, from, to });
          expect(next.error).toBeUndefined();
          expect(next.result).not.toBe('draw');
          expect(next.result).toBeNull();
        }
      }
    }
  );

  it('detects a win completed by a movement rather than leaving result null', () => {
    const state = movementState(['X', 'O', 'X', 'O', 'X', 'O', null, null, null], 'X');
    const next = applyMove(state, { type: 'move', player: 'X', from: 0, to: 6 });
    expect(next.result).toBe('X');
  });
});
