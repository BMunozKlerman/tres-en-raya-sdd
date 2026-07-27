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

export function createGame(mode = 'classic') {
  return {
    board: Array(9).fill(null),
    turn: 'X',
    mode,
    phase: 'placement',
    piecesPlaced: 0,
    result: null,
  };
}

export function applyMove(state, move) {
  if (state.result !== null) {
    return { error: true, reason: 'game_over' };
  }
  if (move.player !== state.turn) {
    return { error: true, reason: 'wrong_turn' };
  }

  if (move.type === 'move' && state.phase === 'placement') {
    return { error: true, reason: 'wrong_phase' };
  }

  if (move.type === 'place' && state.phase === 'movement') {
    return { error: true, reason: 'wrong_phase' };
  }

  if (move.type === 'move') {
    if (state.board[move.from] !== move.player) {
      return { error: true, reason: 'not_own_mark' };
    }

    const newBoard = [...state.board];
    newBoard[move.from] = null;
    newBoard[move.to] = move.player;
    const newTurn = state.turn === 'X' ? 'O' : 'X';
    const hasWinner = WINNING_LINES.some((line) =>
      line.every((i) => newBoard[i] === move.player)
    );

    return {
      ...state,
      board: newBoard,
      turn: newTurn,
      result: hasWinner ? move.player : null,
    };
  }

  if (state.board[move.cell] !== null) {
    return { error: true, reason: 'cell_occupied' };
  }

  const newBoard = [...state.board];
  newBoard[move.cell] = move.player;
  const newPiecesPlaced = state.piecesPlaced + 1;
  const newTurn = state.turn === 'X' ? 'O' : 'X';
  const newPhase =
    state.mode === 'continuous' && newPiecesPlaced === 6 ? 'movement' : state.phase;
  const hasWinner = WINNING_LINES.some((line) =>
    line.every((i) => newBoard[i] === move.player)
  );
  const newResult = hasWinner
    ? move.player
    : state.mode === 'classic' && newPiecesPlaced === 9
      ? 'draw'
      : null;

  return {
    ...state,
    board: newBoard,
    piecesPlaced: newPiecesPlaced,
    turn: newTurn,
    phase: newPhase,
    result: newResult,
  };
}

export function legalMoves(state) {
  if (state.result !== null) {
    return [];
  }

  if (state.phase === 'placement') {
    return state.board.reduce(
      (acc, cell, i) => (cell === null ? [...acc, { type: 'place', cell: i }] : acc),
      []
    );
  }

  return [];
}
