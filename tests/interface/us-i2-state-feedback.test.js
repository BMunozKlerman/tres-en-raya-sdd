// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { mountApp } from '../../src/ui.js';
import { createAppState, startGame, applyPlayerMove } from '../../src/ui/app-state.js';

function mount() {
  document.body.innerHTML = '<div id="app"></div>';
  const root = document.getElementById('app');
  mountApp(root);
  return root;
}

function startHumanVsHuman(root, mode = 'classic') {
  root.querySelector('[data-config-opponent]').value = 'human';
  root.querySelector('[data-config-opponent]').dispatchEvent(new Event('change', { bubbles: true }));
  root.querySelector('[data-config-mark]').value = 'X';
  root.querySelector('[data-config-mark]').dispatchEvent(new Event('change', { bubbles: true }));
  root.querySelector('[data-config-mode]').value = mode;
  root.querySelector('[data-config-mode]').dispatchEvent(new Event('change', { bubbles: true }));
  root.querySelector('[data-start-button]').click();
}

describe('CA-I-03 — turn indicator', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('names the current mark and updates after a move', () => {
    const root = mount();
    startHumanVsHuman(root);

    const indicator = root.querySelector('[data-turn-indicator]');
    expect(indicator.textContent).toContain('X');

    root.querySelector('[data-cell="0"]').click();

    expect(indicator.textContent).toContain('O');
  });
});

describe('CA-I-05 — illegal move rejected with reason', () => {
  it('shows a non-empty error and leaves the board unchanged on wrong_turn', () => {
    let state = createAppState();
    state = startGame(state, {
      opponentType: 'human',
      agentLevel: null,
      marks: { player1: 'X' },
      mode: 'classic',
    });

    const before = state.engineState.board.slice();
    const next = applyPlayerMove(state, { type: 'place', player: 'O', cell: 0 });

    expect(next.lastError).toBeTruthy();
    expect(next.lastError.reason).toBe('wrong_turn');
    expect(next.engineState.board).toEqual(before);
  });

  it('states a distinct game_over reason and leaves the board unchanged on a finished game', () => {
    let state = createAppState();
    state = startGame(state, {
      opponentType: 'human',
      agentLevel: null,
      marks: { player1: 'X' },
      mode: 'classic',
    });
    state = { ...state, engineState: { ...state.engineState, result: 'X' } };

    const before = state.engineState.board.slice();
    const next = applyPlayerMove(state, { type: 'place', player: 'X', cell: 0 });

    expect(next.lastError).toBeTruthy();
    expect(next.lastError.reason).toBe('game_over');
    expect(next.engineState.board).toEqual(before);
  });
});

describe('CA-I-04 — winning line highlighted, moves blocked', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('marks the three winning cells and blocks further clicks', () => {
    const root = mount();
    startHumanVsHuman(root);

    // Hand-verified sequence: X takes the top row (0,1,2), O takes 3,4.
    ['0', '3', '1', '4', '2'].forEach((cellIndex) => {
      root.querySelector(`[data-cell="${cellIndex}"]`).click();
    });

    ['0', '1', '2'].forEach((cellIndex) => {
      expect(root.querySelector(`[data-cell="${cellIndex}"]`).dataset.winning).toBe('true');
    });

    root.querySelector('[data-cell="5"]').click();
    expect(root.querySelector('[data-cell="5"]').dataset.cellState).toBe('empty');
  });
});
