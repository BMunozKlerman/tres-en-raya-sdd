import { createGame, applyMove } from '../engine.js';

export function createAppState() {
  return {
    uiState: 'CONFIGURATION',
    config: { opponentType: null, agentLevel: null, marks: { player1: null }, mode: null },
    engineState: null,
    agentMemory: { simple: null, medium: null, complex: {} },
    scoreboard: { X: 0, O: 0, draw: 0 },
    movementSelection: null,
    lastDecision: null,
  };
}

function isConfigComplete(config) {
  if (!config.opponentType || !config.marks.player1 || !config.mode) return false;
  if (config.opponentType === 'agent' && !config.agentLevel) return false;
  return true;
}

export function startGame(state, config) {
  if (state.uiState !== 'CONFIGURATION' || !isConfigComplete(config)) return state;
  return {
    ...state,
    config,
    engineState: createGame(config.mode),
    uiState: 'IN_GAME',
  };
}

export function applyPlayerMove(state, move) {
  if (state.uiState !== 'IN_GAME') return state;

  const result = applyMove(state.engineState, move);

  if (result && result.error) {
    return { ...state, lastError: { reason: result.reason } };
  }

  let nextUiState = state.uiState;
  let scoreboard = state.scoreboard;
  if (result.result) {
    nextUiState = 'FINISHED';
    const key = result.result === 'draw' ? 'draw' : result.result;
    scoreboard = { ...state.scoreboard, [key]: state.scoreboard[key] + 1 };
  }

  return {
    ...state,
    engineState: result,
    uiState: nextUiState,
    scoreboard,
    movementSelection: null,
    lastError: null,
  };
}

export function selectOwnMark(state, cell) {
  if (state.uiState !== 'IN_GAME' || state.engineState.phase !== 'movement') return state;
  if (state.engineState.board[cell] !== state.engineState.turn) return state;

  return {
    ...state,
    movementSelection: cell === state.movementSelection ? null : cell,
  };
}

export function requestAgentMove(state) {
  if (state.uiState !== 'IN_GAME') return state;
  return { ...state, uiState: 'WAITING_FOR_AGENT' };
}

export { isConfigComplete };
