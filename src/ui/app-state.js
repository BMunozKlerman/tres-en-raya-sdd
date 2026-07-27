import { createGame } from '../engine.js';

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

export { isConfigComplete };
