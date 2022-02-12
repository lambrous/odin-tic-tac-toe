const board = (() => {
  const container = document.querySelector('.board');
  const icons = ['x', 'o'];
  let squares;

  function reset() {
    squares = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
  }

  function getSquaresArr() {
    return squares;
  }

  function initialize() {
    reset();
    container.innerHTML = '';
    displayTiles();
  }

  function displayTiles() {
    squares.forEach((row, i) => {
      row.forEach((_, j) => {
        const tile = createTile(i, j);
        container.appendChild(tile);
      });
    });
  }

  function createTile(row, col) {
    const el = document.createElement('button');
    el.classList.add('square');
    el.addEventListener('click', () => {
      game.getCurrentPlayer().mark(row, col);
      el.textContent = squares[row][col];
    });
    return el;
  }

  function getRow(position) {
    return squares[position];
  }

  function getCol(position) {
    return squares.map((row) => row[position]);
  }

  function getDiagonalLeft() {
    return squares.map((row, i) => row[i]);
  }

  function getDiagonalRight() {
    return squares.map((row, i) => row[row.length - (i + 1)]);
  }

  return {
    icons,
    reset,
    getSquaresArr,
    initialize,
    getCol,
    getRow,
    getDiagonalLeft,
    getDiagonalRight,
  };
})();

const game = (() => {
  const player1 = Player(board.icons[0]);
  const player2 = Player(board.icons[1]);
  let currentPlayer = player1;

  const resetBtn = document.querySelector('.reset-game');
  resetBtn.addEventListener('click', initialize);
  const textEl = document.querySelector('.turn');
  textEl.textContent = currentPlayer.icon;

  function changePlayer(player = 0) {
    if (player === 1) currentPlayer = player1;
    else currentPlayer = currentPlayer === player1 ? player2 : player1;

    setText(`turn: ${currentPlayer.icon}`);
  }

  function getCurrentPlayer() {
    return currentPlayer;
  }

  function initialize() {
    board.initialize();
    player1.resetWin();
    player2.resetWin();
    changePlayer(1);
  }

  function setText(text) {
    textEl.textContent = text;
  }

  function checkArrayEqual(arr, item) {
    return arr.every((i) => i === item);
  }

  function checkRowEqual(icon, position) {
    const row = board.getRow(position);
    return checkArrayEqual(row, icon);
  }

  function checkColEqual(icon, position) {
    const column = board.getCol(position);
    return checkArrayEqual(column, icon);
  }

  function checkDiagonalEqual(icon) {
    const diagonalLeft = board.getDiagonalLeft();
    const diagonalRight = board.getDiagonalRight();
    return (
      checkArrayEqual(diagonalLeft, icon) ||
      checkArrayEqual(diagonalRight, icon)
    );
  }

  return {
    getCurrentPlayer,
    changePlayer,
    initialize,
    setText,
    checkRowEqual,
    checkColEqual,
    checkDiagonalEqual,
  };
})();

function Player(icon) {
  let isWinner = false;

  function resetWin() {
    isWinner = false;
  }

  function mark(row, col) {
    if (board.getSquaresArr()[row][col] !== null || isWinner) return;
    board.getSquaresArr()[row][col] = icon;
    if (checkDidWin(row, col)) setWin();
    else game.changePlayer();
  }

  function checkDidWin(row, col) {
    return (
      game.checkRowEqual(icon, row) ||
      game.checkColEqual(icon, col) ||
      game.checkDiagonalEqual(icon)
    );
  }

  function setWin() {
    game.setText(`${icon} wins`);
    isWinner = true;
  }

  return { icon, mark, resetWin };
}

game.initialize();
