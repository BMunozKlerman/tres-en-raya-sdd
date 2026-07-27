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
