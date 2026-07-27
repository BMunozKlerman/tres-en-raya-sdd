// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { createAppState, startGame, applyPlayerMove } from '../../src/ui/app-state.js';
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
