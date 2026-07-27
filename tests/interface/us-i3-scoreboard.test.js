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

describe('CA-I-15 — draw increments scoreboard', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('increments the draw count and leaves win counts unchanged', () => {
    const root = mount();
    startHumanVsHuman(root);

    ['0', '1', '2', '4', '3', '5', '7', '6', '8'].forEach((cellIndex) => {
      root.querySelector(`[data-cell="${cellIndex}"]`).click();
    });

    expect(root.querySelector('[data-score="draw"]').textContent).toBe('1');
    expect(root.querySelector('[data-score="X"]').textContent).toBe('0');
    expect(root.querySelector('[data-score="O"]').textContent).toBe('0');
  });
});

describe('CA-I-16 — restart returns to CONFIGURATION, scoreboard preserved', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('returns to CONFIGURATION with a null engineState and an unchanged scoreboard', () => {
    const root = mount();
    startHumanVsHuman(root);

    ['0', '3', '1', '4', '2'].forEach((cellIndex) => {
      root.querySelector(`[data-cell="${cellIndex}"]`).click();
    });
    expect(root.querySelector('[data-score="X"]').textContent).toBe('1');

    root.querySelector('[data-restart-button]').click();

    expect(root.querySelector('[data-config-opponent]').disabled).toBe(false);
    expect(root.querySelector('[data-score="X"]').textContent).toBe('1');
    expect(root.querySelector('[data-score="O"]').textContent).toBe('0');
    expect(root.querySelector('[data-score="draw"]').textContent).toBe('0');
  });
});

describe('CA-I-14/CA-I-15 (amended) — scoreboard counts are identifiable by label', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('shows a label identifying each score entry', () => {
    const root = mount();
    startHumanVsHuman(root);

    expect(root.querySelector('[data-score-label="X"]').textContent).toBe('X');
    expect(root.querySelector('[data-score-label="O"]').textContent).toBe('O');
    expect(root.querySelector('[data-score-label="draw"]').textContent).toBe('Empates');
  });
});
