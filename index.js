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

const displayController = (() => {
  const homeContainer = document.querySelector('.home');
  const xNameInput = document.querySelector('#input-x');
  const oNameInput = document.querySelector('#input-o');
  const playersContainer = document.querySelector('.players');
  const player1El = document.querySelector('.player-x');
  const player2El = document.querySelector('.player-o');
  const winnerEl = document.querySelector('.winner');

  function showBoard() {
    homeContainer.classList.remove('visible');
  }

  function hideBoard() {
    homeContainer.classList.add('visible');
  }

  function getPlayerNames() {
    const xName = xNameInput.value || 'Player 1';
    const oName = oNameInput.value || 'Player 2';

    return [xName, oName];
  }

  function updatePlayerTurn(icon) {
    if (icon === board.icons[0]) {
      player1El.classList.add('player-turn');
      player2El.classList.remove('player-turn');
    }
    if (icon === board.icons[1]) {
      player1El.classList.remove('player-turn');
      player2El.classList.add('player-turn');
    }
  }

  function updatePlayerName(icon, name) {
    const playerEl = document.querySelector(`.player-${icon} > .player-name`);
    playerEl.textContent = name;
  }

  function showWinner(text) {
    playersContainer.classList.add('hidden');
    winnerEl.classList.remove('hidden');
    winnerEl.textContent = text;
  }

  function reset() {
    playersContainer.classList.remove('hidden');
    winnerEl.classList.add('hidden');
    updatePlayerTurn(board.icons[0]);
  }

  return {
    showBoard,
    hideBoard,
    getPlayerNames,
    updatePlayerTurn,
    updatePlayerName,
    showWinner,
    reset,
  };
})();

const game = (() => {
  let player1 = Player(board.icons[0], 'Player 1');
  let player2 = Player(board.icons[1], 'Player 2');
  let currentPlayer = player1;
  let winningMarks = null;

  const playBtn = document.querySelector('.btn-play');
  playBtn.addEventListener('click', start);
  const resetBtn = document.querySelector('.reset-game');
  resetBtn.addEventListener('click', initialize);
  const backBtn = document.querySelector('.btn-back');
  backBtn.addEventListener('click', displayController.hideBoard);

  function start() {
    const [xName, oName] = displayController.getPlayerNames();
    player1 = Player(board.icons[0], xName);
    player2 = Player(board.icons[1], oName);
    displayController.showBoard();
    initialize();
  }

  function changePlayer(player = 0) {
    if (player === 1) currentPlayer = player1;
    else currentPlayer = currentPlayer === player1 ? player2 : player1;

    displayController.updatePlayerTurn(currentPlayer.icon);
  }

  function getCurrentPlayer() {
    return currentPlayer;
  }

  function initialize() {
    board.initialize();
    player1.resetWin();
    displayController.updatePlayerName(player1.icon, player1.name);
    player2.resetWin();
    displayController.updatePlayerName(player2.icon, player2.name);
    changePlayer(1);
    resetWinningMarks();
    displayController.reset();
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
    checkHasWinningMarks,
    getWinningMarks,
    setWinningMarksColor,
  };
})();

function Player(icon, name) {
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
      displayController.showWinner('draw');
      return;
    }

    game.changePlayer();
  }

  function setWin() {
    displayController.showWinner(`[${icon}] ${name} wins`);
    isWinner = true;
  }

  function getIsWinner() {
    return isWinner;
  }

  return { icon, name, mark, resetWin, getIsWinner };
}

game.initialize();
