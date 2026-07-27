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

  const newBoard = [...state.board];
  newBoard[move.cell] = move.player;
  const newPiecesPlaced = state.piecesPlaced + 1;
  const newTurn = state.turn === 'X' ? 'O' : 'X';

  return {
    ...state,
    board: newBoard,
    piecesPlaced: newPiecesPlaced,
    turn: newTurn,
  };
}
