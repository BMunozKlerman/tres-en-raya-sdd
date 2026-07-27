import { legalMoves, applyMove } from './engine.js';

const WIN_SCORE = 1000;
const LOSS_SCORE = -1000;

function minimax(state, player, alpha, beta) {
  if (state.result !== null) {
    if (state.result === 'draw') return { value: 0, nodes: 1 };
    return { value: state.result === player ? WIN_SCORE : LOSS_SCORE, nodes: 1 };
  }

  const moves = legalMoves(state);
  const maximizing = state.turn === player;
  let bestValue = maximizing ? -Infinity : Infinity;
  let bestMove = moves[0];
  let nodes = 1;

  for (const move of moves) {
    const next = applyMove(state, { ...move, player: state.turn });
    const result = minimax(next, player, alpha, beta);
    nodes += result.nodes;

    if (maximizing) {
      if (result.value > bestValue) {
        bestValue = result.value;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestValue);
    } else {
      if (result.value < bestValue) {
        bestValue = result.value;
        bestMove = move;
      }
      beta = Math.min(beta, bestValue);
    }

    if (beta <= alpha) break;
  }

  return { value: bestValue, move: bestMove, nodes };
}

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

    const opponent = state.turn === 'X' ? 'O' : 'X';
    const opponentTurnState = { ...state, turn: opponent };
    for (const move of moves) {
      nodesEvaluated += 1;
      const opponentReply = applyMove(opponentTurnState, { ...move, player: opponent });
      if (opponentReply.result === opponent) {
        return { move, memory: null, nodesEvaluated, resolvedFromMemory: false };
      }
    }

    return { move: moves[0], memory: null, nodesEvaluated, resolvedFromMemory: false };
  }

  if (level === 'complex') {
    if (state.mode === 'classic') {
      const result = minimax(state, state.turn, -Infinity, Infinity);
      return { move: result.move, memory, nodesEvaluated: result.nodes, resolvedFromMemory: false };
    }

    const moves = legalMoves(state);
    const move = moves[0];
    return { move, memory, nodesEvaluated: moves.length, resolvedFromMemory: false };
  }
}
