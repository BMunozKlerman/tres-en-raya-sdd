import { startGame, applyPlayerMove, selectOwnMark, requestAgentMove } from './app-state.js';
import { render } from './render.js';

export function attachEvents(root, getState, setState) {
  function rerender() {
    render(root, getState());
  }

  function isAgentTurn(state) {
    return (
      state.uiState === 'IN_GAME' &&
      state.config.opponentType === 'agent' &&
      state.engineState.turn !== state.config.marks.player1
    );
  }

  function maybeHandOffToAgent() {
    const state = getState();
    if (isAgentTurn(state)) {
      setState(requestAgentMove(state));
    }
  }

  function readConfig() {
    const state = getState();
    const opponentType = root.querySelector('[data-config-opponent]').value || null;
    const agentLevelControl = root.querySelector('[data-config-agent-level]');
    const agentLevel = agentLevelControl ? agentLevelControl.value || null : null;
    const player1 = root.querySelector('[data-config-mark]').value || null;
    const mode = root.querySelector('[data-config-mode]').value || null;
    return {
      ...state.config,
      opponentType,
      agentLevel,
      marks: { player1 },
      mode,
    };
  }

  root.querySelector('[data-config-opponent]').addEventListener('change', () => {
    const state = getState();
    setState({ ...state, config: readConfig() });
    rerender();
  });

  root.querySelector('[data-config-mark]').addEventListener('change', () => {
    const state = getState();
    setState({ ...state, config: readConfig() });
    rerender();
  });

  root.querySelector('[data-config-mode]').addEventListener('change', () => {
    const state = getState();
    setState({ ...state, config: readConfig() });
    rerender();
  });

  root.addEventListener('change', (event) => {
    if (event.target.matches('[data-config-agent-level]')) {
      const state = getState();
      setState({ ...state, config: readConfig() });
      rerender();
    }
  });

  root.querySelector('[data-start-button]').addEventListener('click', () => {
    const state = getState();
    setState(startGame(state, readConfig()));
    rerender();
  });

  root.querySelector('[data-board]').addEventListener('click', (event) => {
    const cell = event.target.closest('[data-cell]');
    if (!cell) return;
    const state = getState();
    if (state.uiState !== 'IN_GAME') return;
    const index = Number(cell.dataset.cell);

    if (state.engineState.phase === 'movement') {
      if (state.movementSelection !== null && state.engineState.board[index] === null) {
        setState(
          applyPlayerMove(state, {
            type: 'move',
            player: state.engineState.turn,
            from: state.movementSelection,
            to: index,
          })
        );
        maybeHandOffToAgent();
      } else if (state.engineState.board[index] === state.engineState.turn) {
        setState(selectOwnMark(state, index));
      }
      rerender();
      return;
    }

    setState(
      applyPlayerMove(state, { type: 'place', player: state.engineState.turn, cell: index })
    );
    maybeHandOffToAgent();
    rerender();
  });
}
