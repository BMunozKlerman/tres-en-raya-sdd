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
