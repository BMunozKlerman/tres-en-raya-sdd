import { isConfigComplete } from './app-state.js';
import { legalMoves } from '../engine.js';

function renderConfigControls(root, state) {
  const locked = state.uiState !== 'CONFIGURATION';
  const { config } = state;

  const opponent = root.querySelector('[data-config-opponent]');
  opponent.disabled = locked;
  opponent.value = config.opponentType ?? '';

  if (config.opponentType === 'agent') {
    let agentLevel = root.querySelector('[data-config-agent-level]');
    if (!agentLevel) {
      agentLevel = document.createElement('select');
      agentLevel.setAttribute('data-config-agent-level', '');
      ['simple', 'medium', 'complex'].forEach((level) => {
        const option = document.createElement('option');
        option.value = level;
        option.textContent = level;
        agentLevel.appendChild(option);
      });
      opponent.insertAdjacentElement('afterend', agentLevel);
    }
    agentLevel.disabled = locked;
    agentLevel.value = config.agentLevel ?? '';
  } else {
    const agentLevel = root.querySelector('[data-config-agent-level]');
    if (agentLevel) agentLevel.remove();
  }

  const mark = root.querySelector('[data-config-mark]');
  mark.disabled = locked;
  mark.value = config.marks.player1 ?? '';

  const mode = root.querySelector('[data-config-mode]');
  mode.disabled = locked;
  mode.value = config.mode ?? '';

  const startButton = root.querySelector('[data-start-button]');
  startButton.disabled = locked || !isConfigComplete(config);
}

function renderBoard(root, state) {
  const board = root.querySelector('[data-board]');
  const marks = state.engineState ? state.engineState.board : Array(9).fill(null);
  const winningLine = state.engineState ? state.engineState.winningLine : null;
  const inMovementPhase = state.engineState && state.engineState.phase === 'movement';
  const moves = inMovementPhase ? legalMoves(state.engineState) : [];
  const destinations = state.movementSelection !== null
    ? moves.filter((move) => move.from === state.movementSelection).map((move) => move.to)
    : [];
  const movableFrom = new Set(moves.map((move) => move.from));

  for (let i = 0; i < 9; i += 1) {
    const cell = board.querySelector(`[data-cell="${i}"]`);
    cell.disabled = state.uiState !== 'IN_GAME';
    const mark = marks[i];
    if (mark === null || mark === undefined) {
      cell.dataset.cellState = 'empty';
    } else {
      cell.dataset.cellState = mark === state.config.marks.player1 ? 'own' : 'opponent';
    }

    const markSymbol = mark === null || mark === undefined ? '' : mark;

    if (winningLine && winningLine.includes(i)) {
      cell.dataset.winning = 'true';
      cell.textContent = `${markSymbol} ★`;
    } else {
      delete cell.dataset.winning;
      cell.textContent = markSymbol;
    }

    if (inMovementPhase && movableFrom.has(i)) {
      cell.dataset.movable = 'true';
    } else {
      delete cell.dataset.movable;
    }

    if (i === state.movementSelection) {
      cell.dataset.selected = 'true';
    } else {
      delete cell.dataset.selected;
    }

    if (destinations.includes(i)) {
      cell.dataset.destination = 'true';
    } else {
      delete cell.dataset.destination;
    }
  }
}

function renderStatus(root, state) {
  let turnIndicator = root.querySelector('[data-turn-indicator]');
  if (!turnIndicator) {
    turnIndicator = document.createElement('p');
    turnIndicator.setAttribute('data-turn-indicator', '');
    root.appendChild(turnIndicator);
  }
  turnIndicator.textContent = state.engineState ? `Turno de ${state.engineState.turn}` : '';

  let waitingIndicator = root.querySelector('[data-waiting-indicator]');
  if (state.uiState === 'WAITING_FOR_AGENT') {
    if (!waitingIndicator) {
      waitingIndicator = document.createElement('p');
      waitingIndicator.setAttribute('data-waiting-indicator', '');
      root.appendChild(waitingIndicator);
    }
    waitingIndicator.textContent = 'Esperando al agente…';
  } else if (waitingIndicator) {
    waitingIndicator.remove();
  }

  let memoryIndicator = root.querySelector('[data-memory-indicator]');
  if (state.lastDecision?.resolvedFromMemory === true) {
    if (!memoryIndicator) {
      memoryIndicator = document.createElement('p');
      memoryIndicator.setAttribute('data-memory-indicator', '');
      root.appendChild(memoryIndicator);
    }
    memoryIndicator.textContent = 'Movimiento resuelto desde memoria';
  } else if (memoryIndicator) {
    memoryIndicator.remove();
  }

  let errorIndicator = root.querySelector('[data-error-indicator]');
  if (!errorIndicator) {
    errorIndicator = document.createElement('p');
    errorIndicator.setAttribute('data-error-indicator', '');
    root.appendChild(errorIndicator);
  }
  errorIndicator.textContent = state.lastError ? state.lastError.reason : '';

  let resultIndicator = root.querySelector('[data-result-indicator]');
  if (!resultIndicator) {
    resultIndicator = document.createElement('p');
    resultIndicator.setAttribute('data-result-indicator', '');
    root.appendChild(resultIndicator);
  }
  const result = state.engineState ? state.engineState.result : null;
  resultIndicator.textContent = result ? (result === 'draw' ? 'Empate' : `Gana ${result}`) : '';
}

const SCORE_LABELS = { X: 'X', O: 'O', draw: 'Empates' };

function renderScoreboard(root, state) {
  const scoreboard = root.querySelector('[data-scoreboard]');
  ['X', 'O', 'draw'].forEach((key) => {
    let labelEl = scoreboard.querySelector(`[data-score-label="${key}"]`);
    if (!labelEl) {
      labelEl = document.createElement('span');
      labelEl.setAttribute('data-score-label', key);
      labelEl.textContent = SCORE_LABELS[key];
      scoreboard.appendChild(labelEl);
    }

    let scoreEl = scoreboard.querySelector(`[data-score="${key}"]`);
    if (!scoreEl) {
      scoreEl = document.createElement('span');
      scoreEl.setAttribute('data-score', key);
      scoreboard.appendChild(scoreEl);
    }
    scoreEl.textContent = String(state.scoreboard[key]);
  });
}

function attachFocusVisible(root) {
  root.addEventListener('focus', (event) => {
    if (event.target.matches('[data-config-opponent], [data-config-agent-level], [data-config-mark], [data-config-mode], [data-start-button], [data-restart-button], [data-cell]')) {
      event.target.dataset.focusVisible = 'true';
    }
  }, true);

  root.addEventListener('blur', (event) => {
    if (event.target.dataset) {
      delete event.target.dataset.focusVisible;
    }
  }, true);
}

function buildStructure(root) {
  root.classList.add('app');
  root.innerHTML = `
    <div class="config-panel">
      <select data-config-opponent>
        <option value=""></option>
        <option value="human">human</option>
        <option value="agent">agent</option>
      </select>
      <select data-config-mark>
        <option value=""></option>
        <option value="X">X</option>
        <option value="O">O</option>
      </select>
      <select data-config-mode>
        <option value=""></option>
        <option value="classic">classic</option>
        <option value="continuous">continuous</option>
      </select>
      <button data-start-button type="button">start</button>
    </div>
    <div class="board" data-board role="grid">
      ${Array.from({ length: 9 }, (_, i) => `<button class="cell" data-cell="${i}" type="button"></button>`).join('')}
    </div>
    <div class="scoreboard" data-scoreboard></div>
    <button data-restart-button type="button">restart</button>
    <p class="sr-only" data-live-region role="status" aria-live="polite"></p>
  `;
}

function renderLiveRegion(root, state) {
  const liveRegion = root.querySelector('[data-live-region]');
  const result = state.engineState ? state.engineState.result : null;

  if (result) {
    liveRegion.textContent = result === 'draw' ? 'Empate' : `Gana ${result}`;
  } else if (state.engineState) {
    liveRegion.textContent = `Turno de ${state.engineState.turn}`;
  } else {
    liveRegion.textContent = '';
  }
}

export function render(root, state) {
  if (!root.querySelector('[data-board]')) {
    buildStructure(root);
    attachFocusVisible(root);
  }
  renderConfigControls(root, state);
  renderBoard(root, state);
  renderStatus(root, state);
  renderScoreboard(root, state);
  renderLiveRegion(root, state);
}
