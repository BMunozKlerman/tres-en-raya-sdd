import { legalMoves, applyMove } from './engine.js';

const WIN_SCORE = 1000;
const LOSS_SCORE = -1000;
const HORIZON_DEPTH = 6;

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function staticEvaluation(board, player) {
  let score = 0;
  for (const line of WINNING_LINES) {
    const marks = line.map((i) => board[i]);
    const hasOwn = marks.includes(player);
    const hasOpponent = marks.some((mark) => mark !== null && mark !== player);
    if (hasOwn && !hasOpponent) score += 1;
    else if (hasOpponent && !hasOwn) score -= 1;
  }
  return score;
}

function positionKey(state) {
  const board = state.board.map((cell) => (cell === null ? '_' : cell)).join('');
  return `${state.mode}|${state.phase}|${state.turn}|${board}`;
}

function minimax(state, player, alpha, beta, depth) {
  if (state.result !== null) {
    if (state.result === 'draw') return { value: 0, nodes: 1 };
    return { value: state.result === player ? WIN_SCORE : LOSS_SCORE, nodes: 1 };
  }

  if (state.mode === 'continuous' && depth >= HORIZON_DEPTH) {
    return { value: staticEvaluation(state.board, player), nodes: 1 };
  }

  const moves = legalMoves(state);
  const maximizing = state.turn === player;
  let bestValue = maximizing ? -Infinity : Infinity;
  let bestMove = moves[0];
  let nodes = 1;

  for (const move of moves) {
    const next = applyMove(state, { ...move, player: state.turn });
    const result = minimax(next, player, alpha, beta, depth + 1);
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
    const key = positionKey(state);
    const cached = memory[key];
    if (cached) {
      return { move: cached.move, memory, nodesEvaluated: 1, resolvedFromMemory: true };
    }

    const result = minimax(state, state.turn, -Infinity, Infinity, 0);
    const depth = state.mode === 'continuous' ? HORIZON_DEPTH : Infinity;
    const newMemory = {
      ...memory,
      [key]: { move: result.move, value: result.value, depth },
    };
    return { move: result.move, memory: newMemory, nodesEvaluated: result.nodes, resolvedFromMemory: false };
  }
}
