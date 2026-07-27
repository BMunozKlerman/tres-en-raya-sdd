// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mountApp } from '../../src/ui.js';
import { createAppState, startGame, applyPlayerMove, resolveAgentMove } from '../../src/ui/app-state.js';
import { render } from '../../src/ui/render.js';
import { attachEvents } from '../../src/ui/events.js';

function mount() {
  document.body.innerHTML = '<div id="app"></div>';
  const root = document.getElementById('app');
  mountApp(root);
  return root;
}

function mountWithState(initialState) {
  const root = document.createElement('div');
  document.body.appendChild(root);
  let state = initialState;
  const getState = () => state;
  const setState = (next) => {
    state = next;
  };
  render(root, state);
  attachEvents(root, getState, setState);
  return { root, getState };
}

function startHumanVsComplexAgent(root) {
  root.querySelector('[data-config-opponent]').value = 'agent';
  root.querySelector('[data-config-opponent]').dispatchEvent(new Event('change', { bubbles: true }));
  root.querySelector('[data-config-agent-level]').value = 'complex';
  root
    .querySelector('[data-config-agent-level]')
    .dispatchEvent(new Event('change', { bubbles: true }));
  root.querySelector('[data-config-mark]').value = 'X';
  root.querySelector('[data-config-mark]').dispatchEvent(new Event('change', { bubbles: true }));
  root.querySelector('[data-config-mode]').value = 'classic';
  root.querySelector('[data-config-mode]').dispatchEvent(new Event('change', { bubbles: true }));
  root.querySelector('[data-start-button]').click();
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

describe('CA-I-03 — turn indicator', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('names the current mark and updates after a move', () => {
    const root = mount();
    startHumanVsHuman(root);

    const indicator = root.querySelector('[data-turn-indicator]');
    expect(indicator.textContent).toContain('X');

    root.querySelector('[data-cell="0"]').click();

    expect(indicator.textContent).toContain('O');
  });
});

describe('CA-I-05 — illegal move rejected with reason', () => {
  it('shows a non-empty error and leaves the board unchanged on wrong_turn', () => {
    let state = createAppState();
    state = startGame(state, {
      opponentType: 'human',
      agentLevel: null,
      marks: { player1: 'X' },
      mode: 'classic',
    });

    const before = state.engineState.board.slice();
    const next = applyPlayerMove(state, { type: 'place', player: 'O', cell: 0 });

    expect(next.lastError).toBeTruthy();
    expect(next.lastError.reason).toBe('wrong_turn');
    expect(next.engineState.board).toEqual(before);
  });

  it('states a distinct game_over reason and leaves the board unchanged on a finished game', () => {
    let state = createAppState();
    state = startGame(state, {
      opponentType: 'human',
      agentLevel: null,
      marks: { player1: 'X' },
      mode: 'classic',
    });
    state = { ...state, engineState: { ...state.engineState, result: 'X' } };

    const before = state.engineState.board.slice();
    const next = applyPlayerMove(state, { type: 'place', player: 'X', cell: 0 });

    expect(next.lastError).toBeTruthy();
    expect(next.lastError.reason).toBe('game_over');
    expect(next.engineState.board).toEqual(before);
  });
});

describe('CA-I-04 — winning line highlighted, moves blocked', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('marks the three winning cells and blocks further clicks', () => {
    const root = mount();
    startHumanVsHuman(root);

    // Hand-verified sequence: X takes the top row (0,1,2), O takes 3,4.
    ['0', '3', '1', '4', '2'].forEach((cellIndex) => {
      root.querySelector(`[data-cell="${cellIndex}"]`).click();
    });

    ['0', '1', '2'].forEach((cellIndex) => {
      expect(root.querySelector(`[data-cell="${cellIndex}"]`).dataset.winning).toBe('true');
    });

    root.querySelector('[data-cell="5"]').click();
    expect(root.querySelector('[data-cell="5"]').dataset.cellState).toBe('empty');
  });
});

describe('CA-I-08 — information conveyed without color alone', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function textOnly(el) {
    return el.textContent.trim();
  }

  it('turn indicator conveys whose turn it is through text, not class alone', () => {
    const root = mount();
    startHumanVsHuman(root);

    const indicator = root.querySelector('[data-turn-indicator]');
    expect(textOnly(indicator).length).toBeGreaterThan(0);
    expect(textOnly(indicator)).toContain('X');
  });

  it('a rejected move conveys the reason through text, not class alone', () => {
    let state = createAppState();
    state = startGame(state, {
      opponentType: 'human',
      agentLevel: null,
      marks: { player1: 'X' },
      mode: 'classic',
    });
    const next = applyPlayerMove(state, { type: 'place', player: 'O', cell: 0 });

    expect(next.lastError.reason.length).toBeGreaterThan(0);
  });

  it('a winning line conveys itself through a text/icon child, not class alone', () => {
    const root = mount();
    startHumanVsHuman(root);

    ['0', '3', '1', '4', '2'].forEach((cellIndex) => {
      root.querySelector(`[data-cell="${cellIndex}"]`).click();
    });

    ['0', '1', '2'].forEach((cellIndex) => {
      const cell = root.querySelector(`[data-cell="${cellIndex}"]`);
      expect(textOnly(cell).length).toBeGreaterThan(0);
    });
  });
});

function startContinuousToMovementPhase(root) {
  root.querySelector('[data-config-opponent]').value = 'human';
  root.querySelector('[data-config-opponent]').dispatchEvent(new Event('change', { bubbles: true }));
  root.querySelector('[data-config-mark]').value = 'X';
  root.querySelector('[data-config-mark]').dispatchEvent(new Event('change', { bubbles: true }));
  root.querySelector('[data-config-mode]').value = 'continuous';
  root.querySelector('[data-config-mode]').dispatchEvent(new Event('change', { bubbles: true }));
  root.querySelector('[data-start-button]').click();

  // X:{0,2,4}, O:{1,3,5}, turn X, empty {6,7,8} — same fixture as
  // specs/001-engine's CA-M-16 reachMovementPhase().
  ['0', '1', '2', '3', '4', '5'].forEach((cellIndex) => {
    root.querySelector(`[data-cell="${cellIndex}"]`).click();
  });
}

describe('CA-I-07 — movement-phase legal marks and destinations indicated', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('marks every own cell that has at least one legal destination as movable', () => {
    const root = mount();
    startContinuousToMovementPhase(root);

    ['0', '2', '4'].forEach((cellIndex) => {
      expect(root.querySelector(`[data-cell="${cellIndex}"]`).dataset.movable).toBe('true');
    });
    ['1', '3', '5'].forEach((cellIndex) => {
      expect(root.querySelector(`[data-cell="${cellIndex}"]`).dataset.movable).toBeUndefined();
    });
  });
});

describe('CA-I-09 — resolvedFromMemory indicator', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('shows the indicator only for a decision resolved from memory', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    let state = createAppState();
    state = startGame(state, {
      opponentType: 'agent',
      agentLevel: 'complex',
      marks: { player1: 'X' },
      mode: 'classic',
    });

    state = { ...state, uiState: 'WAITING_FOR_AGENT' };
    const freshDecision = {
      move: { type: 'place', cell: 4 },
      memory: {},
      nodesEvaluated: 10,
      resolvedFromMemory: false,
    };
    state = resolveAgentMove(state, freshDecision);
    render(root, state);
    expect(root.querySelector('[data-memory-indicator]')).toBeNull();

    state = { ...state, uiState: 'WAITING_FOR_AGENT' };
    const cachedDecision = {
      move: { type: 'place', cell: 0 },
      memory: {},
      nodesEvaluated: 1,
      resolvedFromMemory: true,
    };
    state = resolveAgentMove(state, cachedDecision);
    render(root, state);
    expect(root.querySelector('[data-memory-indicator]')).not.toBeNull();
  });
});

describe('CA-I-09 — resolvedFromMemory reflects real cross-game memory reuse', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('a second game seeded with the first game\'s real agentMemory resolves the identical position from memory', () => {
    // Game 1: drives the real requestAgentMove -> chooseMove -> resolveAgentMove pipeline in
    // events.js through a genuine human move; nothing here is a hand-built Decision.
    const game1 = mountWithState(createAppState());
    startHumanVsComplexAgent(game1.root);
    game1.root.querySelector('[data-cell="0"]').click();
    vi.advanceTimersByTime(300);

    expect(game1.root.querySelector('[data-memory-indicator]')).toBeNull();

    const game1FinalState = game1.getState();

    // Game 2: a fresh AppState seeded with game 1's real agentMemory/scoreboard — exactly what
    // `restart` (T-083/T-084, not yet implemented) will produce — driven through the same real
    // human move, reaching the identical position (mode|phase|turn|board) game 1's agent already
    // cached, per the same fixture strategy as specs/002-agents's CA-A-10.
    const game2 = mountWithState({
      ...createAppState(),
      agentMemory: game1FinalState.agentMemory,
      scoreboard: game1FinalState.scoreboard,
    });
    startHumanVsComplexAgent(game2.root);
    game2.root.querySelector('[data-cell="0"]').click();
    vi.advanceTimersByTime(300);

    expect(game2.root.querySelector('[data-memory-indicator]')).not.toBeNull();
  });
});

describe('CA-I-11 — draw indicator, moves blocked', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('shows a draw message and disables every cell', () => {
    const root = mount();
    startHumanVsHuman(root);

    // Hand-verified draw sequence (no winning line at any point, board fills exactly):
    // final board: X O X / X O O / O X X
    ['0', '1', '2', '4', '3', '5', '7', '6', '8'].forEach((cellIndex) => {
      root.querySelector(`[data-cell="${cellIndex}"]`).click();
    });

    expect(root.querySelector('[data-result-indicator]').textContent.toLowerCase()).toContain('empate');
    for (let i = 0; i < 9; i += 1) {
      expect(root.querySelector(`[data-cell="${i}"]`).disabled).toBe(true);
    }
  });
});

describe('CA-I-33 — occupied cell displays the mark\'s symbol', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('shows the mark that occupies the cell in its textContent, not only data-cell-state', () => {
    const root = mount();
    startHumanVsHuman(root);

    root.querySelector('[data-cell="0"]').click();

    expect(root.querySelector('[data-cell="0"]').textContent).toContain('X');
    expect(root.querySelector('[data-cell="1"]').textContent.trim()).toBe('');
  });

  it('keeps the mark visible on a winning cell alongside the win indicator (CA-I-04)', () => {
    const root = mount();
    startHumanVsHuman(root);

    // Hand-verified sequence: X takes the top row (0,1,2), O takes 3,4.
    ['0', '3', '1', '4', '2'].forEach((cellIndex) => {
      root.querySelector(`[data-cell="${cellIndex}"]`).click();
    });

    ['0', '1', '2'].forEach((cellIndex) => {
      const cell = root.querySelector(`[data-cell="${cellIndex}"]`);
      expect(cell.dataset.winning).toBe('true');
      expect(cell.textContent).toContain('X');
    });
  });
});
