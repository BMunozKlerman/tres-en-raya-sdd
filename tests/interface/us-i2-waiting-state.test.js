// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mountApp } from '../../src/ui.js';

function mount() {
  document.body.innerHTML = '<div id="app"></div>';
  const root = document.getElementById('app');
  mountApp(root);
  return root;
}

function startHumanVsAgent(root) {
  root.querySelector('[data-config-opponent]').value = 'agent';
  root.querySelector('[data-config-opponent]').dispatchEvent(new Event('change', { bubbles: true }));
  root.querySelector('[data-config-agent-level]').value = 'simple';
  root
    .querySelector('[data-config-agent-level]')
    .dispatchEvent(new Event('change', { bubbles: true }));
  root.querySelector('[data-config-mark]').value = 'X';
  root.querySelector('[data-config-mark]').dispatchEvent(new Event('change', { bubbles: true }));
  root.querySelector('[data-config-mode]').value = 'classic';
  root.querySelector('[data-config-mode]').dispatchEvent(new Event('change', { bubbles: true }));
  root.querySelector('[data-start-button]').click();
}

describe('CA-I-06 — waiting state shown, board disabled', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('shows the waiting indicator and disables every cell once it becomes the agent\'s turn', () => {
    const root = mount();
    startHumanVsAgent(root);

    root.querySelector('[data-cell="0"]').click();

    expect(root.querySelector('[data-waiting-indicator]')).not.toBeNull();
    for (let i = 0; i < 9; i += 1) {
      expect(root.querySelector(`[data-cell="${i}"]`).disabled).toBe(true);
    }
  });
});

describe('CA-I-12 — IN_GAME to WAITING_FOR_AGENT transition', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('transitions synchronously the instant it becomes the agent\'s turn', () => {
    const root = mount();
    startHumanVsAgent(root);

    root.querySelector('[data-cell="0"]').click();

    expect(root.querySelector('[data-waiting-indicator]')).not.toBeNull();
  });
});

describe('CA-I-10 — waiting state visible for at least 300ms', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps WAITING_FOR_AGENT and the board disabled just before the 300ms floor elapses', () => {
    const root = mount();
    startHumanVsAgent(root);

    root.querySelector('[data-cell="0"]').click();
    const filledBefore = Array.from(root.querySelectorAll('[data-cell]')).filter(
      (cell) => cell.dataset.cellState !== 'empty'
    ).length;

    vi.advanceTimersByTime(299);

    expect(root.querySelector('[data-waiting-indicator]')).not.toBeNull();
    for (let i = 0; i < 9; i += 1) {
      expect(root.querySelector(`[data-cell="${i}"]`).disabled).toBe(true);
    }
    const filledAfter = Array.from(root.querySelectorAll('[data-cell]')).filter(
      (cell) => cell.dataset.cellState !== 'empty'
    ).length;
    expect(filledAfter).toBe(filledBefore);
  });
});

describe('CA-I-13 — WAITING_FOR_AGENT to IN_GAME transition after floor elapses', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('applies the agent move and returns to IN_GAME once 300ms elapse', () => {
    const root = mount();
    startHumanVsAgent(root);

    root.querySelector('[data-cell="0"]').click();
    const filledBefore = Array.from(root.querySelectorAll('[data-cell]')).filter(
      (cell) => cell.dataset.cellState !== 'empty'
    ).length;

    vi.advanceTimersByTime(300);

    expect(root.querySelector('[data-waiting-indicator]')).toBeNull();
    const filledAfter = Array.from(root.querySelectorAll('[data-cell]')).filter(
      (cell) => cell.dataset.cellState !== 'empty'
    ).length;
    expect(filledAfter).toBe(filledBefore + 1);
    for (let i = 0; i < 9; i += 1) {
      expect(root.querySelector(`[data-cell="${i}"]`).disabled).toBe(false);
    }
  });
});
