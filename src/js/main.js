var canvas;
var ctx;
var player;
var map;

var TILE_SIZE = 16;
var MAP_SIZE_X = 20;
var MAP_SIZE_Y = 20;


document.addEventListener("mousedown", mouseDown);
document.addEventListener("mouseup", mouseUp);
document.addEventListener("mousemove", mouseMove);

function startGame() {
  player = new Player({ x: 50, y: 50 }, 10, 2);
  map = new Map(1)

  canvas = document.getElementById('gameCanvas');
  canvas.width = map.width * TILE_SIZE;
  canvas.height = map.height * TILE_SIZE;
  ctx = canvas.getContext('2d');

  setInterval(draw, 10)
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawPlayer();  

  if(player.moving) {
    movePlayer(player.destination)
  }
}

function drawPlayer() {
  ctx.drawImage(player.spriteAsset, player.sprite.x, player.sprite.y, TILE_SIZE, TILE_SIZE, player.position.x, player.position.y, TILE_SIZE, TILE_SIZE);
}

function drawMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  var grass = { x: 0*TILE_SIZE, y: 1*TILE_SIZE }
  var wall = { x: 1*TILE_SIZE, y: 1*TILE_SIZE }

  for(var i = 0; i < map.height; i++) {

    for(var j = 0; j < map.width; j++) {
      if (map.data[i][j] == 1) {
        ctx.drawImage(map.mapAsset, wall.x, wall.y, TILE_SIZE, TILE_SIZE, j*TILE_SIZE, i*TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
      else {
        ctx.drawImage(map.mapAsset, grass.x, grass.y, TILE_SIZE, TILE_SIZE, j*TILE_SIZE, i*TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

// Input
function mouseDown(event) {
  player.moving = true;
  player.destination = getMousePos(canvas, event);
}

function mouseUp(event) {
  player.moving = false;
}

function mouseMove(event) {
  if(player.moving) {
    player.destination = getMousePos(canvas, event);
  }
}

function movePlayer(destination) {
  if (distance(player.position, destination) > 5) {
    var playerPos = player.position;

    var delta = subtract(destination, playerPos);
    var norm = normalize(delta);

    var newPlayerPos = add(playerPos, multiply(norm, player.speed));

    player.position = newPlayerPos;
    player.updateSprite(destination)
  }
}

function getMousePos(canvas, event) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function createSprite(src) {
  var sprite = new Image();
  sprite.src = src;
  sprite.context = ctx;
  sprite.width = TILE_SIZE;
  sprite.height = TILE_SIZE;

  return sprite;
}
