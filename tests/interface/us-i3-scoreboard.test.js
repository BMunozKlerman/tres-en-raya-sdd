// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { mountApp } from '../../src/ui.js';

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

describe('CA-I-14 — win increments scoreboard', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('increments the winning mark count and leaves the others unchanged', () => {
    const root = mount();
    startHumanVsHuman(root);

    ['0', '3', '1', '4', '2'].forEach((cellIndex) => {
      root.querySelector(`[data-cell="${cellIndex}"]`).click();
    });

    expect(root.querySelector('[data-score="X"]').textContent).toBe('1');
    expect(root.querySelector('[data-score="O"]').textContent).toBe('0');
    expect(root.querySelector('[data-score="draw"]').textContent).toBe('0');
  });
});
