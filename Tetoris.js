// Tetris Game Implementation with Game Over and Score Display
const rows = 20;
const cols = 10;

// DOM Elements
const playfield = document.getElementById('playfield');
const nextField = document.getElementById('next-field');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const retryButton = document.getElementById('retry-button');
const grid = [];
const nextGrid = [];
const upButton = document.getElementById('up-button');
const downButton = document.getElementById('down-button');
const leftButton = document.getElementById('left-button');
const rightButton = document.getElementById('right-button');

// Tetromino shapes
const tetrominos = {
  I: [[[1, 1, 1, 1]], [[1], [1], [1], [1]]],
  O: [[[1, 1], [1, 1]]],
  T: [[[0, 1, 0], [1, 1, 1]], [[1, 0], [1, 1], [1, 0]], [[1, 1, 1], [0, 1, 0]], [[0, 1], [1, 1], [0, 1]]],
  L: [[[1, 0], [1, 0], [1, 1]], [[1, 1, 1], [1, 0, 0]], [[1, 1], [0, 1], [0, 1]], [[0, 0, 1], [1, 1, 1]]],
  J: [[[0, 1], [0, 1], [1, 1]], [[1, 0, 0], [1, 1, 1]], [[1, 1], [1, 0], [1, 0]], [[1, 1, 1], [0, 0, 1]]],
  Z: [[[1, 1, 0], [0, 1, 1]], [[0, 1], [1, 1], [1, 0]]],
  S: [[[0, 1, 1], [1, 1, 0]], [[1, 0], [1, 1], [0, 1]]],
};

const tetrominoKeys = Object.keys(tetrominos);
let currentTetromino;
let nextTetromino;
let currentPosition = { row: 0, col: 3 };
let currentRotation = 0;
let score = 0;
let isGameOver = false;
let gameInterval;

// Create playfield grid
for (let r = 0; r < rows; r++) {
  const row = [];
  for (let c = 0; c < cols; c++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    playfield.appendChild(cell);
    row.push(cell);
  }
  grid.push(row);
}

// Create next-block grid
for (let r = 0; r < 4; r++) {
  const row = [];
  for (let c = 0; c < 4; c++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    nextField.appendChild(cell);
    row.push(cell);
  }
  nextGrid.push(row);
}

// Draw Tetromino
function drawTetromino(tetromino, position, field) {
  tetromino.shape[tetromino.rotation].forEach((row, rIdx) => {
    row.forEach((cell, cIdx) => {
      if (cell) {
        const x = position.row + rIdx;
        const y = position.col + cIdx;
        if (x >= 0 && y >= 0 && x < rows && y < cols) {
          field[x][y].classList.add('active');
        }
      }
    });
  });
}

// Clear grid
function clearGrid(field) {
  field.forEach(row => row.forEach(cell => cell.classList.remove('active')));
}

// Generate random tetromino
function randomTetromino() {
  const key = tetrominoKeys[Math.floor(Math.random() * tetrominoKeys.length)];
  return { key, shape: tetrominos[key], rotation: 0 };
}

// Rotate tetromino
function rotateTetromino(direction) {
  const previousRotation = currentTetromino.rotation;
  currentTetromino.rotation = (currentTetromino.rotation + direction + currentTetromino.shape.length) % currentTetromino.shape.length;

  if (checkCollision()) {
    currentTetromino.rotation = previousRotation; // Revert rotation if collision occurs
  }
}

// Check for collision
function checkCollision() {
  return currentTetromino.shape[currentTetromino.rotation].some((row, rIdx) => {
    return row.some((cell, cIdx) => {
      if (cell) {
        const x = currentPosition.row + rIdx;
        const y = currentPosition.col + cIdx;
        return x >= rows || y < 0 || y >= cols || (x >= 0 && grid[x][y].classList.contains('fixed'));
      }
      return false;
    });
  });
}

// Place Tetromino
function placeTetromino() {
  currentTetromino.shape[currentTetromino.rotation].forEach((row, rIdx) => {
    row.forEach((cell, cIdx) => {
      if (cell) {
        const x = currentPosition.row + rIdx;
        const y = currentPosition.col + cIdx;
        if (x >= 0 && y >= 0 && x < rows && y < cols) {
          grid[x][y].classList.add('fixed');
        }
      }
    });
  });
  clearFullRows();
}

// Clear full rows
function clearFullRows() {
  for (let r = rows - 1; r >= 0; r--) {
    if (grid[r].every(cell => cell.classList.contains('fixed'))) {
      grid[r].forEach(cell => cell.classList.remove('fixed'));
      for (let row = r - 1; row >= 0; row--) {
        grid[row].forEach((cell, colIdx) => {
          if (cell.classList.contains('fixed')) {
            cell.classList.remove('fixed');
            grid[row + 1][colIdx].classList.add('fixed');
          }
        });
      }
      r++;
      score += 100;
    }
  }
  scoreDisplay.textContent = `Score: ${score}`;
}

// Move Tetromino Down
function moveDown() {
  if (isGameOver) return;
  currentPosition.row++;
  if (checkCollision()) {
    currentPosition.row--;
    placeTetromino();
    spawnNewTetromino();
  }
  update();
}

// Spawn a new tetromino
function spawnNewTetromino() {
  if (grid[0].some(cell => cell.classList.contains('fixed'))) {
    endGame();
    return;
  }
  currentTetromino = nextTetromino;
  nextTetromino = randomTetromino();
  currentPosition = { row: 0, col: 3 };
  drawNextBlock();
}

// Draw next block
function drawNextBlock() {
  clearGrid(nextGrid);
  nextTetromino.shape[0].forEach((row, rIdx) => {
    row.forEach((cell, cIdx) => {
      if (cell) {
        nextGrid[rIdx][cIdx].classList.add('active');
      }
    });
  });
}

// Update grid
function update() {
  clearGrid(grid);
  drawTetromino(currentTetromino, currentPosition, grid);
}

// End the game
function endGame() {
  isGameOver = true;
  clearInterval(gameInterval);
  gameOverScreen.style.display = 'flex';
}

// Retry button
retryButton.addEventListener('click', () => {
  location.reload();
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (isGameOver) return;
  if (e.key === 'ArrowLeft') {
    currentPosition.col--;
    if (checkCollision()) currentPosition.col++;
  } else if (e.key === 'ArrowRight') {
    currentPosition.col++;
    if (checkCollision()) currentPosition.col--;
  } else if (e.key === 'ArrowUp') {
    rotateTetromino(1);
  } else if (e.key === 'ArrowDown') {
    moveDown();
  }
  update();
});

// Button controls
upButton.addEventListener('click', () => {
  if (!isGameOver) {
    rotateTetromino(1);
    update();
  }
});

downButton.addEventListener('click', () => {
  if (!isGameOver) {
    moveDown();
  }
});

leftButton.addEventListener('click', () => {
  if (!isGameOver) {
    currentPosition.col--;
    if (checkCollision()) currentPosition.col++;
    update();
  }
});

rightButton.addEventListener('click', () => {
  if (!isGameOver) {
    currentPosition.col++;
    if (checkCollision()) currentPosition.col--;
    update();
  }
});

// Initialize game
function startGame() {
  currentTetromino = randomTetromino();
  nextTetromino = randomTetromino();
  drawNextBlock();
  update();
  gameInterval = setInterval(moveDown, 500);
}

startGame();

document.getElementById('existing-button').addEventListener('click', function() {
    window.location.href = 'file:///C:/Aososo%20site/index.html'; // ローカルのフルパス
});
