// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
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
