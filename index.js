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

  function getSquareEl(pos) {
    return document.querySelector(`[data-mark="${pos}"]`);
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
    el.setAttribute('data-mark', `${row}-${col}`);
    el.addEventListener('click', () => {
      game.getCurrentPlayer().mark(row, col);
      el.textContent = squares[row][col];
    });
    return el;
  }

  function getRow(pos) {
    return squares[pos];
  }

  function getCol(pos) {
    return squares.map((row) => row[pos]);
  }

  function getDiagonalLeft() {
    return squares.map((row, i) => row[i]);
  }

  function getDiagonalRight() {
    return squares.map((row, i) => row[row.length - (i + 1)]);
  }

  function checkBoardFill() {
    return squares.every((row) => row.every((item) => item !== null));
  }

  return {
    icons,
    reset,
    getSquaresArr,
    getSquareEl,
    initialize,
    getCol,
    getRow,
    getDiagonalLeft,
    getDiagonalRight,
    checkBoardFill,
  };
})();

const game = (() => {
  const player1 = Player(board.icons[0]);
  const player2 = Player(board.icons[1]);
  let currentPlayer = player1;
  let winningMarks = null;

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
    resetWinningMarks();
  }

  function setText(text) {
    textEl.textContent = text;
  }

  function checkArrayEqual(arr, item) {
    return arr.every((i) => i === item);
  }

  function checkTrioMarks({ arr, icon }, func) {
    if (checkArrayEqual(arr, icon)) {
      winningMarks = arr.map(func);
      return true;
    } else return false;
  }

  const checkRowEqual = function (icon, pos) {
    const arr = board.getRow(pos);
    const mapFunc = (_, i) => `${pos}-${i}`;
    return checkTrioMarks({ arr, icon }, mapFunc);
  };

  const checkColEqual = function (icon, pos) {
    const arr = board.getCol(pos);
    const mapFunc = (_, i) => `${i}-${pos}`;
    return checkTrioMarks({ arr, icon }, mapFunc);
  };

  const checkDiagonalLeftEqual = function (icon) {
    const arr = board.getDiagonalLeft();
    const mapFunc = (_, i) => `${i}-${i}`;
    return checkTrioMarks({ arr, icon }, mapFunc);
  };

  const checkDiagonalRightEqual = function (icon) {
    const arr = board.getDiagonalRight();
    const mapFunc = (_, i) => {
      const col = arr.length - (i + 1);
      return `${i}-${col}`;
    };
    return checkTrioMarks({ arr, icon }, mapFunc);
  };

  function checkHasWinningMarks(icon, pos) {
    return (
      checkRowEqual(icon, pos.row) ||
      checkColEqual(icon, pos.col) ||
      checkDiagonalLeftEqual(icon) ||
      checkDiagonalRightEqual(icon)
    );
  }

  function getWinningMarks() {
    return winningMarks;
  }

  function resetWinningMarks() {
    winningMarks = null;
  }

  function setWinningMarksColor() {
    winningMarks.forEach((pos) => {
      const square = board.getSquareEl(pos);
      square.classList.add('mark-win');
    });
  }

  return {
    getCurrentPlayer,
    changePlayer,
    initialize,
    setText,
    checkHasWinningMarks,
    getWinningMarks,
    setWinningMarksColor,
  };
})();

function Player(icon) {
  let isWinner = false;

  function resetWin() {
    isWinner = false;
  }

  function mark(row, col) {
    if (board.getSquaresArr()[row][col] !== null || isWinner) return;

    const squareEl = board.getSquareEl(`${row}-${col}`);
    squareEl.classList.add(`mark-${icon}`);
    board.getSquaresArr()[row][col] = icon;

    if (game.checkHasWinningMarks(icon, { row, col })) {
      setWin();
      game.setWinningMarksColor();
      return;
    }

    if (board.checkBoardFill()) {
      game.setText('draw');
      return;
    }

    game.changePlayer();
  }

  function setWin() {
    game.setText(`${icon} wins`);
    isWinner = true;
  }

  function getIsWinner() {
    return isWinner;
  }

  return { icon, mark, resetWin, getIsWinner };
}

game.initialize();
