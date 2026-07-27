import { legalMoves, applyMove } from './engine.js';

export function chooseMove(state, level, memory, options = {}) {
  if (level === 'simple') {
    const moves = legalMoves(state);
    const random = options.random ?? Math.random;
    const move = moves[Math.floor(random() * moves.length)];
    return { move, memory, nodesEvaluated: moves.length, resolvedFromMemory: false };
  }

  if (level === 'medium') {
    const moves = legalMoves(state);
    let nodesEvaluated = 0;

    for (const move of moves) {
      nodesEvaluated += 1;
      const next = applyMove(state, { ...move, player: state.turn });
      if (next.result === state.turn) {
        return { move, memory: null, nodesEvaluated, resolvedFromMemory: false };
      }
    }

    return { move: moves[0], memory: null, nodesEvaluated, resolvedFromMemory: false };
  }
}
