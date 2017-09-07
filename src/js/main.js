var canvas;
var ctx;
var player;
var map;

var TILE_SIZE = 16;
var MAP_SIZE_X = 20;
var MAP_SIZE_Y = 20;
var COLLISION_SIZE = 1;
var DESTINATION_RANGE = 5

document.addEventListener("mousedown", mouseDown);
document.addEventListener("mouseup", mouseUp);
document.addEventListener("mousemove", mouseMove);

function startGame() {
  player = new Player({ x: 185, y: 55 }, 10, 2);
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
    checkPlayerCollision()
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

  if (distance(player.position, destination) > DESTINATION_RANGE) {
    checkPlayerCollision()

    var playerPos = player.position;

    var delta = subtract(destination, playerPos);

    var xReached = Math.abs(delta.x) < DESTINATION_RANGE
    var yReached = Math.abs(delta.y) < DESTINATION_RANGE

    if ((!player.availableDir.up && delta.y < 0) || (!player.availableDir.down && delta.y > 0) || yReached) {
      delta.y = 0;
    }
    if ((!player.availableDir.left && delta.x < 0) || (!player.availableDir.right && delta.x > 0) || xReached) {
      delta.x = 0;
    }

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

function checkPlayerCollision() {
  // player origin is top left

  var playerPos = player.position;
  console.log((map.getTileFromCoordinates(playerPos.x, playerPos.y)))
  player.availableDir.left = !(map.getTileFromCoordinates(playerPos.x - COLLISION_SIZE, playerPos.y) == WALL_TILE);
  player.availableDir.right = !(map.getTileFromCoordinates(playerPos.x + COLLISION_SIZE + TILE_SIZE, playerPos.y) == WALL_TILE);
  player.availableDir.up = !(map.getTileFromCoordinates(playerPos.x, playerPos.y - COLLISION_SIZE) == WALL_TILE);
  player.availableDir.down = !(map.getTileFromCoordinates(playerPos.x, playerPos.y + COLLISION_SIZE + TILE_SIZE) == WALL_TILE);
}
