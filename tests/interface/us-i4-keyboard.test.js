// @vitest-environment jsdom
import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  createAppState,
  startGame,
  applyPlayerMove,
  requestAgentMove,
} from '../../src/ui/app-state.js';
import { render } from '../../src/ui/render.js';
import { attachEvents } from '../../src/ui/events.js';

function mount() {
  const root = document.createElement('div');
  document.body.appendChild(root);
  let state = createAppState();
  const getState = () => state;
  const setState = (next) => {
    state = next;
  };
  render(root, state);
  attachEvents(root, getState, setState);
  return { root, getState, setState, rerender: () => render(root, getState()) };
}

describe('CA-I-17 — focus-visible hook toggles on focus/blur', () => {
  let root;

  beforeEach(() => {
    ({ root } = mount());
  });

  it('toggles data-focus-visible on a configuration control', () => {
    const control = root.querySelector('[data-config-opponent]');
    control.focus();
    expect(control.dataset.focusVisible).toBe('true');
    control.blur();
    expect(control.dataset.focusVisible).toBeUndefined();
  });

  it('toggles data-focus-visible on a board cell', () => {
    const state = startGame(createAppState(), {
      opponentType: 'human',
      agentLevel: null,
      marks: { player1: 'X' },
      mode: 'classic',
    });
    render(root, state);

    const cell = root.querySelector('[data-cell="0"]');
    cell.focus();
    expect(cell.dataset.focusVisible).toBe('true');
    cell.blur();
    expect(cell.dataset.focusVisible).toBeUndefined();
  });
});

describe('CA-I-18 — arrow keys move cell selection', () => {
  let root;

  beforeEach(() => {
    ({ root } = mount());
    const state = startGame(createAppState(), {
      opponentType: 'human',
      agentLevel: null,
      marks: { player1: 'X' },
      mode: 'classic',
    });
    render(root, state);
  });

  function dispatchArrow(from, key) {
    const cell = root.querySelector(`[data-cell="${from}"]`);
    cell.focus();
    cell.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  }

  it('moves focus right from the center cell', () => {
    dispatchArrow(4, 'ArrowRight');
    expect(document.activeElement).toBe(root.querySelector('[data-cell="5"]'));
  });

  it('moves focus left from the center cell', () => {
    dispatchArrow(4, 'ArrowLeft');
    expect(document.activeElement).toBe(root.querySelector('[data-cell="3"]'));
  });

  it('moves focus up from the center cell', () => {
    dispatchArrow(4, 'ArrowUp');
    expect(document.activeElement).toBe(root.querySelector('[data-cell="1"]'));
  });

  it('moves focus down from the center cell', () => {
    dispatchArrow(4, 'ArrowDown');
    expect(document.activeElement).toBe(root.querySelector('[data-cell="7"]'));
  });
});

describe('CA-I-38 — visible keyboard instruction', () => {
  it('states how to operate the board while a game is in progress', () => {
    const { root, setState, getState } = mount();
    setState(
      startGame(createAppState(), {
        opponentType: 'human',
        agentLevel: null,
        marks: { player1: 'X' },
        mode: 'classic',
      })
    );
    render(root, getState());

    const instructions = root.querySelector('[data-keyboard-instructions]');
    expect(instructions).not.toBeNull();
    expect(instructions.textContent.length).toBeGreaterThan(0);
    expect(instructions.textContent.toLowerCase()).toMatch(/flecha/);
    expect(instructions.textContent.toLowerCase()).toMatch(/enter|espacio/);
  });

  it('is present while waiting for the agent', () => {
    const { root, setState, getState } = mount();
    setState(
      startGame(createAppState(), {
        opponentType: 'agent',
        agentLevel: 'simple',
        marks: { player1: 'X' },
        mode: 'classic',
      })
    );
    render(root, requestAgentMove(getState()));

    expect(root.querySelector('[data-keyboard-instructions]')).not.toBeNull();
  });
});

describe('CA-I-19 — Enter/Space activates like a click', () => {
  it('placement: Enter on an empty cell applies the same move a click would', () => {
    const { root, getState, setState } = mount();
    setState(
      startGame(createAppState(), {
        opponentType: 'human',
        agentLevel: null,
        marks: { player1: 'X' },
        mode: 'classic',
      })
    );
    render(root, getState());

    const cell = root.querySelector('[data-cell="4"]');
    cell.focus();
    cell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(getState().engineState.board[4]).toBe('X');
  });

  it('placement: Space on an empty cell applies the same move a click would', () => {
    const { root, getState, setState } = mount();
    setState(
      startGame(createAppState(), {
        opponentType: 'human',
        agentLevel: null,
        marks: { player1: 'X' },
        mode: 'classic',
      })
    );
    render(root, getState());

    const cell = root.querySelector('[data-cell="4"]');
    cell.focus();
    cell.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

    expect(getState().engineState.board[4]).toBe('X');
  });

  it('movement phase: Enter on an own mark selects it, same as a click', () => {
    const { root, getState, setState } = mount();
    let state = startGame(createAppState(), {
      opponentType: 'human',
      agentLevel: null,
      marks: { player1: 'X' },
      mode: 'continuous',
    });
    // Drive to the movement phase with a hand-verified non-winning fixture: X ends up owning
    // cells {0,1,3} (no winning line), O ends up owning {2,4,5} (no winning line either).
    // Per D4, the player who did NOT place the 6th mark (O) opens the movement phase, so X
    // moves next and owns cells 0,1,3.
    const placements = [0, 2, 1, 4, 3, 5];
    for (const cell of placements) {
      state = applyPlayerMove(state, { type: 'place', player: state.engineState.turn, cell });
    }
    setState(state);
    render(root, getState());

    const ownMarkCell = 0;
    const cell = root.querySelector(`[data-cell="${ownMarkCell}"]`);
    cell.focus();
    cell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(getState().movementSelection).toBe(ownMarkCell);
  });
});

describe('CA-I-20 — turn/result announced without moving focus', () => {
  it('exposes a single role=status aria-live=polite live region at startup', () => {
    const { root } = mount();
    const liveRegion = root.querySelector('[data-live-region]');
    expect(liveRegion).not.toBeNull();
    expect(liveRegion.getAttribute('role')).toBe('status');
    expect(liveRegion.getAttribute('aria-live')).toBe('polite');
  });

  it('announces a turn change without moving focus', () => {
    const { root, getState, setState } = mount();
    setState(
      startGame(createAppState(), {
        opponentType: 'human',
        agentLevel: null,
        marks: { player1: 'X' },
        mode: 'classic',
      })
    );
    render(root, getState());

    const cell = root.querySelector('[data-cell="4"]');
    cell.focus();
    cell.click();

    const liveRegion = root.querySelector('[data-live-region]');
    expect(liveRegion.textContent).not.toBe('');
    expect(document.activeElement).toBe(cell);
  });

  it('announces the result without moving focus', () => {
    const { root, getState, setState } = mount();
    let state = startGame(createAppState(), {
      opponentType: 'human',
      agentLevel: null,
      marks: { player1: 'X' },
      mode: 'classic',
    });
    // Hand-verified winning sequence for X: top row (0,1,2).
    const moves = [
      { cell: 0, player: 'X' },
      { cell: 3, player: 'O' },
      { cell: 1, player: 'X' },
      { cell: 4, player: 'O' },
      { cell: 2, player: 'X' },
    ];
    for (const { cell, player } of moves) {
      state = applyPlayerMove(state, { type: 'place', player, cell });
    }
    setState(state);
    // `[data-restart-button]` is never disabled (dom-contract.md), unlike the board cells CA-I-04
    // disables on a win — so it is the stable element to assert focus retention against.
    const restartButton = root.querySelector('[data-restart-button]');
    restartButton.focus();
    render(root, getState());

    const liveRegion = root.querySelector('[data-live-region]');
    expect(liveRegion.textContent).not.toBe('');
    expect(document.activeElement).toBe(restartButton);
  });
});

describe('BUG-011 — live region is visually hidden without leaving the accessibility tree', () => {
  let css;

  beforeAll(() => {
    const stylesPath = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../src/styles.css',
    );
    css = readFileSync(stylesPath, 'utf-8');
  });

  it('marks [data-live-region] with the sr-only class', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    render(root, createAppState());

    const liveRegion = root.querySelector('[data-live-region]');
    expect(liveRegion.classList.contains('sr-only')).toBe(true);
  });

  it('declares .sr-only using the clip technique, not display:none or visibility:hidden', () => {
    const match = css.match(/(^|[^\w-])\.sr-only\s*\{([^}]*)\}/m);
    expect(match, 'expected a .sr-only rule in styles.css').not.toBeNull();
    const rule = match[2];
    expect(rule).not.toMatch(/display\s*:\s*none/);
    expect(rule).not.toMatch(/visibility\s*:\s*hidden/);
    expect(rule).toMatch(/position\s*:\s*absolute/);
    expect(rule).toMatch(/overflow\s*:\s*hidden/);
  });
});
