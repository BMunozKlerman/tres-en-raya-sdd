import { isConfigComplete } from './app-state.js';

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
  for (let i = 0; i < 9; i += 1) {
    const cell = board.querySelector(`[data-cell="${i}"]`);
    cell.disabled = state.uiState !== 'IN_GAME';
  }
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
}
