const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restartBtn');

// Player car
let player = { x: 280, y: 320, width: 40, height: 60, speed: 5 };

// Controls
let keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

// Road
let road = { width: 200, x: 200 };

// Trees
let trees = [];
for(let i=0; i<20; i++){
  trees.push({ x: Math.random()*canvas.width, y: i*100, width: 20, height: 50 });
}

// Obstacles
let obstacles = [];

// Score
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let distance = 0;

// Game state
let gameOver = false;
let animationId;

// Restart button
restartBtn.addEventListener('click', () => {
  resetGame();
  gameLoop(); // restart the animation
});

// Draw functions
function drawPlayer(){
  ctx.fillStyle = '#FF0000'; // Red car
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = '#000'; // wheels
  ctx.fillRect(player.x+5, player.y+5, 10, 10);
  ctx.fillRect(player.x+25, player.y+5, 10, 10);
  ctx.fillRect(player.x+5, player.y+45, 10, 10);
  ctx.fillRect(player.x+25, player.y+45, 10, 10);
}

function drawRoad(){
  ctx.fillStyle = '#555';
  ctx.fillRect(road.x, 0, road.width, canvas.height);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 4;
  for(let i=0; i<canvas.height; i+=40){
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, i - distance%40);
    ctx.lineTo(canvas.width/2, i - distance%40 + 20);
    ctx.stroke();
  }
}

function drawTrees(){
  ctx.fillStyle = '#228B22';
  trees.forEach(tree => ctx.fillRect(tree.x, tree.y, tree.width, tree.height));
}

function updateTrees(){
  trees.forEach(tree => {
    tree.y += 5;
    if(tree.y > canvas.height){
      tree.y = -50;
      tree.x = Math.random() * canvas.width;
    }
  });
}

// Obstacles
function spawnObstacles(){
  if(Math.random() < 0.02){
    let width = 40;
    let height = 40;
    let x = road.x + Math.random()*(road.width - width);
    obstacles.push({ x, y: -height, width, height });
  }
}

function drawObstacles(){
  ctx.fillStyle = '#000';
  obstacles.forEach(obs => ctx.fillRect(obs.x, obs.y, obs.width, obs.height));
}

function updateObstacles(){
  obstacles.forEach(obs => obs.y += 5);
  obstacles = obstacles.filter(obs => obs.y < canvas.height + 50);
}

// Collision detection
function checkCollision(){
  for(let obs of obstacles){
    if(player.x < obs.x + obs.width &&
       player.x + player.width > obs.x &&
       player.y < obs.y + obs.height &&
       player.y + player.height > obs.y){
      endGame();
      break;
    }
  }
}

// Player movement
function movePlayer(){
  if(keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
  if(keys['ArrowRight'] || keys['d']) player.x += player.speed;
  if(keys['ArrowUp'] || keys['w']) player.y -= player.speed;
  if(keys['ArrowDown'] || keys['s']) player.y += player.speed;

  if(player.x < road.x) player.x = road.x;
  if(player.x + player.width > road.x + road.width) player.x = road.x + road.width - player.width;
  if(player.y < 0) player.y = 0;
  if(player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

// Dynamic sky
function changeSky(){
  let gradient = ctx.createLinearGradient(0,0,0,canvas.height);
  let r = Math.min(135 + distance/10, 255);
  let g = Math.min(206 + distance/20, 255);
  let b = Math.min(235 + distance/30, 255);
  gradient.addColorStop(0, `rgb(${r},${g},${b})`);
  gradient.addColorStop(1, '#ffffff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

// Score update
function updateScore(){
  score = Math.floor(distance/10);
  if(score > highScore){
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }
  document.getElementById('scoreBoard').innerText = `Score: ${score} | High: ${highScore}`;
}

// End game
function endGame(){
  gameOver = true;
  cancelAnimationFrame(animationId);
  restartBtn.style.display = 'block';
}

// Reset game
function resetGame(){
  obstacles = [];
  player.x = 280;
  player.y = 320;
  distance = 0;
  score = 0;
  gameOver = false;
  restartBtn.style.display = 'none';
}

// Game loop
function gameLoop(){
  animationId = requestAnimationFrame(gameLoop);
  if(!gameOver){
    distance += 5;
    changeSky();
    drawRoad();
    drawTrees();
    drawPlayer();
    movePlayer();
    updateTrees();
    spawnObstacles();
    drawObstacles();
    updateObstacles();
    checkCollision();
    updateScore();
  }
}

gameLoop();
