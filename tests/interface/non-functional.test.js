// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mountApp } from '../../src/ui.js';

function selectValue(control, value) {
  control.value = value;
  control.dispatchEvent(new Event('change', { bubbles: true }));
}

function pressKey(element, key) {
  element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('CA-N-02 — fully operable with mouse (click handlers cover every action)', () => {
  it('completes a full classic game and restarts using only click and select-change events', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    mountApp(root);

    selectValue(root.querySelector('[data-config-opponent]'), 'human');
    selectValue(root.querySelector('[data-config-mark]'), 'X');
    selectValue(root.querySelector('[data-config-mode]'), 'classic');

    const startButton = root.querySelector('[data-start-button]');
    expect(startButton.disabled).toBe(false);
    startButton.click();

    root.querySelector('[data-cell="0"]').click();
    root.querySelector('[data-cell="3"]').click();
    root.querySelector('[data-cell="1"]').click();
    root.querySelector('[data-cell="4"]').click();
    root.querySelector('[data-cell="2"]').click();

    expect(root.querySelector('[data-result-indicator]').textContent).toContain('X');

    root.querySelector('[data-restart-button]').click();

    expect(root.querySelector('[data-config-opponent]').disabled).toBe(false);
    expect(root.querySelector('[data-score="X"]').textContent).toBe('1');
  });

  it('completes movement-phase selection and destination clicks in continuous mode using only click events', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    mountApp(root);

    selectValue(root.querySelector('[data-config-opponent]'), 'human');
    selectValue(root.querySelector('[data-config-mark]'), 'X');
    selectValue(root.querySelector('[data-config-mode]'), 'continuous');
    root.querySelector('[data-start-button]').click();

    [0, 1, 2, 3, 4, 5].forEach((cell) => {
      root.querySelector(`[data-cell="${cell}"]`).click();
    });

    const movable = root.querySelector('[data-movable="true"]');
    expect(movable).not.toBeNull();
    movable.click();
    expect(movable.dataset.selected).toBe('true');

    const destination = root.querySelector('[data-destination="true"]');
    expect(destination).not.toBeNull();
    destination.click();
    expect(destination.dataset.cellState).not.toBe('empty');
  });
});

describe('CA-N-03 — full game completable via keyboard alone', () => {
  it('completes a full classic game and restarts without dispatching any click event', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    mountApp(root);

    selectValue(root.querySelector('[data-config-opponent]'), 'human');
    selectValue(root.querySelector('[data-config-mark]'), 'X');
    selectValue(root.querySelector('[data-config-mode]'), 'classic');

    const startButton = root.querySelector('[data-start-button]');
    startButton.focus();
    pressKey(startButton, 'Enter');

    expect(root.querySelector('[data-config-opponent]').disabled).toBe(true);

    const moves = [0, 3, 1, 4, 2];
    moves.forEach((cellIndex) => {
      const cell = root.querySelector(`[data-cell="${cellIndex}"]`);
      cell.focus();
      pressKey(cell, ' ');
    });

    expect(root.querySelector('[data-result-indicator]').textContent).toContain('X');

    const restartButton = root.querySelector('[data-restart-button]');
    restartButton.focus();
    pressKey(restartButton, 'Enter');

    expect(root.querySelector('[data-config-opponent]').disabled).toBe(false);
    expect(root.querySelector('[data-score="X"]').textContent).toBe('1');
  });
});
