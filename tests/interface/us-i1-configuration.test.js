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

describe('CA-I-35 — configuration controls show identifying placeholder labels', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('labels the opponent, mark, and mode placeholders on first load', () => {
    const root = mount();
    expect(root.querySelector('[data-config-opponent] option[value=""]').textContent).toBe(
      'Oponente…'
    );
    expect(root.querySelector('[data-config-mark] option[value=""]').textContent).toBe('Ficha…');
    expect(root.querySelector('[data-config-mode] option[value=""]').textContent).toBe(
      'Modalidad…'
    );
  });

  it('labels the agent-level placeholder once it appears, unselected', () => {
    const root = mount();
    setConfig(root, { opponent: 'agent' });
    expect(root.querySelector('[data-config-agent-level] option[value=""]').textContent).toBe(
      'Nivel…'
    );
  });

  it('keeps the placeholder labels, not blank text, after restart', () => {
    const root = mount();
    setConfig(root, { opponent: 'human', mark: 'X', mode: 'classic' });
    root.querySelector('[data-start-button]').click();
    root.querySelector('[data-restart-button]').click();

    expect(root.querySelector('[data-config-opponent]').value).toBe('');
    expect(root.querySelector('[data-config-opponent] option[value=""]').textContent).toBe(
      'Oponente…'
    );
    expect(root.querySelector('[data-config-mark] option[value=""]').textContent).toBe('Ficha…');
    expect(root.querySelector('[data-config-mode] option[value=""]').textContent).toBe(
      'Modalidad…'
    );
  });
});

describe('CA-I-37 — configuration option text is in Spanish', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  const SPANISH_TEXT = {
    human: 'Humano',
    agent: 'Agente',
    classic: 'Clásica',
    continuous: 'Continua',
    simple: 'Simple',
    medium: 'Medio',
    complex: 'Complejo',
  };

  it('shows opponent and mode options in Spanish, values unchanged', () => {
    const root = mount();

    ['human', 'agent'].forEach((value) => {
      const option = root.querySelector(`[data-config-opponent] option[value="${value}"]`);
      expect(option.value).toBe(value);
      expect(option.textContent).toBe(SPANISH_TEXT[value]);
    });

    ['classic', 'continuous'].forEach((value) => {
      const option = root.querySelector(`[data-config-mode] option[value="${value}"]`);
      expect(option.value).toBe(value);
      expect(option.textContent).toBe(SPANISH_TEXT[value]);
    });
  });

  it('shows agent-level options in Spanish, values unchanged', () => {
    const root = mount();
    setConfig(root, { opponent: 'agent' });

    ['simple', 'medium', 'complex'].forEach((value) => {
      const option = root.querySelector(`[data-config-agent-level] option[value="${value}"]`);
      expect(option.value).toBe(value);
      expect(option.textContent).toBe(SPANISH_TEXT[value]);
    });
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
