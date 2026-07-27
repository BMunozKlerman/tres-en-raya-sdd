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
