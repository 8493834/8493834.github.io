const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');
const pauseBtn = document.getElementById('pauseBtn');
const difficultySelect = document.getElementById('difficulty');

// Game Constants
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 16;
const PADDLE_SPEED = 5;

// Difficulty values
const DIFFICULTY = {
  easy: 2,
  medium: 3,
  hard: 5
};
let AI_SPEED = DIFFICULTY['medium'];

// Game State
let leftPaddleY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let rightPaddleY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let ballX = WIDTH / 2 - BALL_SIZE / 2;
let ballY = HEIGHT / 2 - BALL_SIZE / 2;
let ballVelX = 5 * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = 4 * (Math.random() > 0.5 ? 1 : -1);

let playerScore = 0;
let aiScore = 0;
let paused = false;

// Mouse Paddle Control
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  leftPaddleY = mouseY - PADDLE_HEIGHT / 2;
  leftPaddleY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, leftPaddleY));
});

// Pause Button Control
pauseBtn.addEventListener('click', () => {
  paused = !paused;
  pauseBtn.textContent = paused ? 'Resume' : 'Pause';
});

// Difficulty Control
difficultySelect.addEventListener('change', (e) => {
  AI_SPEED = DIFFICULTY[e.target.value];
  // Reset points when difficulty changes
  playerScore = 0;
  aiScore = 0;
});

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Draw paddles
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, leftPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillRect(WIDTH - PADDLE_WIDTH, rightPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT);

  // Draw ball
  ctx.fillRect(ballX, ballY, BALL_SIZE, BALL_SIZE);

  // Draw scores
  ctx.font = '32px Arial';
  ctx.fillText(playerScore, WIDTH / 4, 40);
  ctx.fillText(aiScore, WIDTH * 3 / 4, 40);

  // Draw paused overlay
  if (paused) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Paused', WIDTH / 2, HEIGHT / 2);
    ctx.textAlign = 'start';
  }
}

// Collision detection helper
function rectIntersect(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// Update game logic
function update() {
  if (paused) return;

  // Ball movement
  ballX += ballVelX;
  ballY += ballVelY;

  // Ball collision with top/bottom
  if (ballY < 0) {
    ballY = 0;
    ballVelY *= -1;
  }
  if (ballY + BALL_SIZE > HEIGHT) {
    ballY = HEIGHT - BALL_SIZE;
    ballVelY *= -1;
  }

  // Ball collision with left paddle
  if (rectIntersect(ballX, ballY, BALL_SIZE, BALL_SIZE, 0, leftPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT)) {
    ballX = PADDLE_WIDTH;
    ballVelX *= -1;
    ballVelY += ((ballY + BALL_SIZE / 2) - (leftPaddleY + PADDLE_HEIGHT / 2)) * 0.15;
  }

  // Ball collision with right paddle
  if (rectIntersect(ballX, ballY, BALL_SIZE, BALL_SIZE, WIDTH - PADDLE_WIDTH, rightPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT)) {
    ballX = WIDTH - PADDLE_WIDTH - BALL_SIZE;
    ballVelX *= -1;
    ballVelY += ((ballY + BALL_SIZE / 2) - (rightPaddleY + PADDLE_HEIGHT / 2)) * 0.15;
  }

  // Ball out of bounds (score)
  if (ballX < 0) {
    aiScore++;
    resetBall(-1);
  }
  if (ballX + BALL_SIZE > WIDTH) {
    playerScore++;
    resetBall(1);
  }

  // AI paddle movement (simple linear tracking)
  const aiCenter = rightPaddleY + PADDLE_HEIGHT / 2;
  const ballCenter = ballY + BALL_SIZE / 2;
  if (aiCenter < ballCenter - 10) {
    rightPaddleY += AI_SPEED;
  } else if (aiCenter > ballCenter + 10) {
    rightPaddleY -= AI_SPEED;
  }
  rightPaddleY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, rightPaddleY));
}

// Reset ball after score
function resetBall(direction) {
  ballX = WIDTH / 2 - BALL_SIZE / 2;
  ballY = HEIGHT / 2 - BALL_SIZE / 2;
  ballVelX = direction * 5;
  ballVelY = (Math.random() - 0.5) * 7;
}

// Main loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();