import { describe, it, expect } from 'vitest';
import { createGame, applyMove, legalMoves } from '../../src/engine.js';
import { chooseMove } from '../../src/agents.js';

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

function buildState(mode, phase) {
  if (mode === 'classic' && phase === 'placement') return createGame('classic');
  if (mode === 'continuous' && phase === 'placement') return createGame('continuous');
  if (mode === 'continuous' && phase === 'movement') return reachMovementPhase();
  throw new Error(`Unsupported combination: ${mode}/${phase}`);
}

const modePhaseCombos = [
  ['classic', 'placement'],
  ['continuous', 'placement'],
  ['continuous', 'movement'],
];

describe('CA-A-01 — simple: legal move in every mode × phase', () => {
  it.each(modePhaseCombos)('returns a legal move in %s mode during %s phase', (mode, phase) => {
    const state = buildState(mode, phase);
    const decision = chooseMove(state, 'simple', null);
    expect(legalMoves(state)).toContainEqual(decision.move);
  });
});
