// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { createAppState, startGame } from '../../src/ui/app-state.js';
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
