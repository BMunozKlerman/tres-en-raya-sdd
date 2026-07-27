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
    cell.dataset.cellState = mark === null || mark === undefined ? 'empty' : 'own';

    if (winningLine && winningLine.includes(i)) {
      cell.dataset.winning = 'true';
      cell.textContent = '★';
    } else {
      delete cell.dataset.winning;
      cell.textContent = '';
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

function renderScoreboard(root, state) {
  ['X', 'O', 'draw'].forEach((key) => {
    let scoreEl = root.querySelector(`[data-score="${key}"]`);
    if (!scoreEl) {
      scoreEl = document.createElement('span');
      scoreEl.setAttribute('data-score', key);
      root.appendChild(scoreEl);
    }
    scoreEl.textContent = String(state.scoreboard[key]);
  });
}

function buildStructure(root) {
  root.innerHTML = `
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
    <div data-board role="grid">
      ${Array.from({ length: 9 }, (_, i) => `<button data-cell="${i}" type="button"></button>`).join('')}
    </div>
  `;
}

export function render(root, state) {
  if (!root.querySelector('[data-board]')) {
    buildStructure(root);
  }
  renderConfigControls(root, state);
  renderBoard(root, state);
  renderStatus(root, state);
  renderScoreboard(root, state);
}
