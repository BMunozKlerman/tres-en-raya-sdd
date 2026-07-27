// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { mountApp } from '../../src/ui.js';

function mount() {
  document.body.innerHTML = '<div id="app"></div>';
  const root = document.getElementById('app');
  mountApp(root);
  return root;
}

function startGame(root, { opponent = 'human', mark = 'X', mode = 'classic', agentLevel } = {}) {
  root.querySelector('[data-config-opponent]').value = opponent;
  root.querySelector('[data-config-opponent]').dispatchEvent(new Event('change', { bubbles: true }));
  if (opponent === 'agent') {
    root.querySelector('[data-config-agent-level]').value = agentLevel;
    root
      .querySelector('[data-config-agent-level]')
      .dispatchEvent(new Event('change', { bubbles: true }));
  }
  root.querySelector('[data-config-mark]').value = mark;
  root.querySelector('[data-config-mark]').dispatchEvent(new Event('change', { bubbles: true }));
  root.querySelector('[data-config-mode]').value = mode;
  root.querySelector('[data-config-mode]').dispatchEvent(new Event('change', { bubbles: true }));
  root.querySelector('[data-start-button]').click();
}

describe('CA-I-24 — configuration inaccessible outside CONFIGURATION', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('disables all configuration controls and the start button once a game is in progress', () => {
    const root = mount();
    startGame(root);

    expect(root.querySelector('[data-config-opponent]').disabled).toBe(true);
    expect(root.querySelector('[data-config-mark]').disabled).toBe(true);
    expect(root.querySelector('[data-config-mode]').disabled).toBe(true);
    expect(root.querySelector('[data-start-button]').disabled).toBe(true);
  });
});

function startContinuousToMovementPhase(root) {
  startGame(root, { mode: 'continuous' });
  // X:{0,2,4}, O:{1,3,5}, turn X, empty {6,7,8} — same fixture as
  // specs/001-engine's CA-M-16 reachMovementPhase().
  ['0', '1', '2', '3', '4', '5'].forEach((cellIndex) => {
    root.querySelector(`[data-cell="${cellIndex}"]`).click();
  });
}

describe('CA-I-25 — own-mark selection highlights destinations', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('selects the clicked own mark and highlights its legal destinations', () => {
    const root = mount();
    startContinuousToMovementPhase(root);

    root.querySelector('[data-cell="0"]').click();

    expect(root.querySelector('[data-cell="0"]').dataset.selected).toBe('true');
    ['6', '7', '8'].forEach((cellIndex) => {
      expect(root.querySelector(`[data-cell="${cellIndex}"]`).dataset.destination).toBe('true');
    });
  });
});

describe('CA-I-27 — reselecting own mark cancels selection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('clears the selection and destinations when the same mark is clicked again', () => {
    const root = mount();
    startContinuousToMovementPhase(root);

    root.querySelector('[data-cell="0"]').click();
    root.querySelector('[data-cell="0"]').click();

    expect(root.querySelector('[data-cell="0"]').dataset.selected).toBeUndefined();
    ['6', '7', '8'].forEach((cellIndex) => {
      expect(root.querySelector(`[data-cell="${cellIndex}"]`).dataset.destination).toBeUndefined();
    });
  });
});

describe('CA-I-26 — destination selection applies the move', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('moves the mark from source to destination and clears the selection', () => {
    const root = mount();
    startContinuousToMovementPhase(root);

    root.querySelector('[data-cell="0"]').click();
    root.querySelector('[data-cell="7"]').click();

    expect(root.querySelector('[data-cell="0"]').dataset.cellState).toBe('empty');
    expect(root.querySelector('[data-cell="7"]').dataset.cellState).toBe('own');
    expect(root.querySelector('[data-cell="0"]').dataset.selected).toBeUndefined();
    expect(root.querySelector('[data-cell="7"]').dataset.destination).toBeUndefined();
  });
});

function startHumanVsAgent(root) {
  startGame(root, { opponent: 'agent', agentLevel: 'simple' });
}

describe('CA-I-22 — input ignored during WAITING_FOR_AGENT', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('leaves the board unchanged when a cell is clicked while waiting for the agent', () => {
    const root = mount();
    startHumanVsAgent(root);

    root.querySelector('[data-cell="0"]').click();
    const before = Array.from(root.querySelectorAll('[data-cell]')).map((c) => c.dataset.cellState);

    root.querySelector('[data-cell="1"]').click();

    const after = Array.from(root.querySelectorAll('[data-cell]')).map((c) => c.dataset.cellState);
    expect(after).toEqual(before);
  });
});

describe('CA-I-23 — restart during movement phase clears pending selection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('returns to CONFIGURATION and leaves no stale selection on the next game', () => {
    const root = mount();
    startContinuousToMovementPhase(root);

    root.querySelector('[data-cell="0"]').click();
    expect(root.querySelector('[data-cell="0"]').dataset.selected).toBe('true');

    root.querySelector('[data-restart-button]').click();

    expect(root.querySelector('[data-config-opponent]').disabled).toBe(false);

    startContinuousToMovementPhase(root);

    for (let i = 0; i < 9; i += 1) {
      expect(root.querySelector(`[data-cell="${i}"]`).dataset.selected).toBeUndefined();
      expect(root.querySelector(`[data-cell="${i}"]`).dataset.destination).toBeUndefined();
    }
  });
});

describe('CA-I-21 — occupied cell rejected', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('states the cell occupied reason and leaves the board unchanged', () => {
    const root = mount();
    startGame(root);

    root.querySelector('[data-cell="0"]').click();
    const before = Array.from(root.querySelectorAll('[data-cell]')).map((c) => c.dataset.cellState);

    root.querySelector('[data-cell="0"]').click();

    const after = Array.from(root.querySelectorAll('[data-cell]')).map((c) => c.dataset.cellState);
    expect(after).toEqual(before);
    expect(root.querySelector('[data-error-indicator]').textContent).toMatch(/cell_occupied|occupied/i);
  });
});
