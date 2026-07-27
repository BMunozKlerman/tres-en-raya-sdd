// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { mountApp } from '../../src/ui.js';

function mount() {
  document.body.innerHTML = '<div id="app"></div>';
  const root = document.getElementById('app');
  mountApp(root);
  return root;
}

function setConfig(root, { opponent, mark, mode, agentLevel } = {}) {
  if (opponent !== undefined) {
    root.querySelector('[data-config-opponent]').value = opponent;
    root
      .querySelector('[data-config-opponent]')
      .dispatchEvent(new Event('change', { bubbles: true }));
  }
  if (agentLevel !== undefined) {
    root.querySelector('[data-config-agent-level]').value = agentLevel;
    root
      .querySelector('[data-config-agent-level]')
      .dispatchEvent(new Event('change', { bubbles: true }));
  }
  if (mark !== undefined) {
    root.querySelector('[data-config-mark]').value = mark;
    root.querySelector('[data-config-mark]').dispatchEvent(new Event('change', { bubbles: true }));
  }
  if (mode !== undefined) {
    root.querySelector('[data-config-mode]').value = mode;
    root.querySelector('[data-config-mode]').dispatchEvent(new Event('change', { bubbles: true }));
  }
}

describe('CA-I-01 — configuration controls displayed', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('displays opponent, mark, and mode controls, and shows agent level only when opponent is agent', () => {
    const root = mount();
    expect(root.querySelector('[data-config-opponent]')).not.toBeNull();
    expect(root.querySelector('[data-config-mark]')).not.toBeNull();
    expect(root.querySelector('[data-config-mode]')).not.toBeNull();
    expect(root.querySelector('[data-config-agent-level]')).toBeNull();

    setConfig(root, { opponent: 'agent' });
    expect(root.querySelector('[data-config-agent-level]')).not.toBeNull();
  });
});

describe('CA-I-02 — start transitions CONFIGURATION to IN_GAME', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('keeps start disabled until all required fields are set, then transitions on click', () => {
    const root = mount();
    const startButton = root.querySelector('[data-start-button]');
    expect(startButton.disabled).toBe(true);

    setConfig(root, { opponent: 'agent', mark: 'X', mode: 'classic', agentLevel: 'simple' });
    expect(startButton.disabled).toBe(false);

    startButton.click();

    const cells = root.querySelectorAll('[data-cell]');
    expect(cells.length).toBe(9);
    cells.forEach((cell) => {
      expect(cell.disabled).toBe(false);
    });
  });
});
