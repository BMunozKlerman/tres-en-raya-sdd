import { legalMoves } from './engine.js';

export function chooseMove(state, level, memory, options = {}) {
  if (level === 'simple') {
    const moves = legalMoves(state);
    const random = options.random ?? Math.random;
    const move = moves[Math.floor(random() * moves.length)];
    return { move, memory, nodesEvaluated: moves.length, resolvedFromMemory: false };
  }

  if (level === 'medium') {
    const moves = legalMoves(state);
    const move = moves[0];
    return { move, memory: null, nodesEvaluated: moves.length, resolvedFromMemory: false };
  }
}
