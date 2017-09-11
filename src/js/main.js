var canvas;
var ctx;
var player;
var enemy;
var map;
var camera;
var hud;
var enemySpawnId = null;

var SCALE = 8;
var TILE_SIZE = 16;
var HALF_TILE = TILE_SIZE / 2;
var MAP_SIZE_X = 20;
var MAP_SIZE_Y = 20;
var PLAYER_HITBOX_SIZE = 12;
var COLLISION_CHECK_RANGE = 2;
var DESTINATION_RANGE = 5;
var CANVAS_WIDTH = 50 * TILE_SIZE;
var CANVAS_HEIGHT = 40 * TILE_SIZE;
var OFFSCREEN = { x: -100, y: -100 }
var WARNING_TIME = 5000;
var DANGER_TIME = 2000;

document.addEventListener("mousedown", mouseDown);
document.addEventListener("mouseup", mouseUp);
document.addEventListener("mousemove", mouseMove);

function startGame() {
  map = new Map(1)
  player = new Player(map.getPlayerStartPos() || { x: 190, y: 60 }, 3, 4 / SCALE);
  enemy = new Enemy(OFFSCREEN);
  camera = new Camera(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, map.width * TILE_SIZE, map.height * TILE_SIZE, SCALE)
  camera.setDeadZone(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  camera.follow(player);
  hud = new Hud(player.life, CANVAS_WIDTH, CANVAS_HEIGHT);

  canvas = document.getElementById('gameCanvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  ctx = canvas.getContext('2d');
  ctx.scale(SCALE,SCALE);
  ctx.mozImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  setInterval(update, 10)
}

function update() {
  camera.update();
  draw();

  if(player.moving) {
    movePlayer(player.destination);
    checkPlayerCollision();
  }

  checkPlayerPath();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap(GRASS_TILE);
  drawPlayer();
  drawMap(WALL_TILE);
  drawEnemy();
  drawHUD();
}

function drawPlayer() {
  var position = {};
  position.x = player.getPosition().x - HALF_TILE;
  position.y = player.getPosition().y - HALF_TILE;

  position = camera.getWorldToScreenPos(position.x, position.y)
  ctx.drawImage(player.spriteAsset, player.sprite.x, player.sprite.y, TILE_SIZE, TILE_SIZE, position.x, position.y, TILE_SIZE, TILE_SIZE);
}

function drawMap(tileType) {
  var grass = map.getTileImage('grass');
  var wall = map.getTileImage('wall');

  var viewport = camera.getViewport();
  // draw only visible tiles
  var startCol = clamp(Math.floor(viewport.left / TILE_SIZE) - 1, 0, map.width);
  var startRow = clamp(Math.floor(viewport.top / TILE_SIZE) - 1, 0, map.height);
  var endCol = clamp(Math.ceil(viewport.right / TILE_SIZE) + 1, 0, map.width);
  var endRow = clamp(Math.ceil(viewport.bottom / TILE_SIZE) + 1, 0, map.height);

  for(var i = startRow; i < endRow; i++) {
    for(var j = startCol; j < endCol; j++) {
      if (tileType == WALL_TILE && map.data[i][j] == WALL_TILE) {
        ctx.drawImage(map.mapAsset, grass.x, grass.y, grass.width, grass.height, (j*TILE_SIZE) - viewport.left, (i*TILE_SIZE) - viewport.top, grass.width, grass.height);
        ctx.drawImage(map.mapAsset, wall.x, wall.y, wall.width, wall.height, (j*TILE_SIZE) - viewport.left, ((i*TILE_SIZE) - viewport.top) - TILE_SIZE, wall.width, wall.height);
      }
      else if (tileType == GRASS_TILE){
        ctx.drawImage(map.mapAsset, grass.x, grass.y, TILE_SIZE, TILE_SIZE, (j*TILE_SIZE) - viewport.left, (i*TILE_SIZE) - viewport.top, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

function drawEnemy() {
  var position = camera.getWorldToScreenPos(enemy.position.x - HALF_TILE, enemy.position.y - HALF_TILE)
  ctx.drawImage(enemy.spriteAsset, enemy.sprite.x, enemy.sprite.y, TILE_SIZE, TILE_SIZE, position.x, position.y, TILE_SIZE, TILE_SIZE);
}

function drawHUD() {
  var life = hud.getTileImage('life');
  var emptyLife = hud.getTileImage('emptyLife');
  var lifeBarPos = hud.getLifeBarPos();
  for (var i = 0; i < player.getMaxLife(); i++) {
    if (i < player.getLife()) {
      ctx.drawImage(hud.spriteAsset, life.x, life.y, life.width, life.height, lifeBarPos.x + (i * TILE_SIZE / 2), lifeBarPos.y, life.width / 2, life.height / 2);
    }
    else {
      ctx.drawImage(hud.spriteAsset, emptyLife.x, emptyLife.y, emptyLife.width, emptyLife.height, lifeBarPos.x + (i * TILE_SIZE / 2), lifeBarPos.y, emptyLife.width / 2, emptyLife.height / 2);
    }
  }
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

// Input
function mouseDown(event) {
  player.moving = true;
  var mousePos = getMousePos(canvas, event);
  player.destination = camera.getScreenToWorldPos(mousePos.x, mousePos.y);
}

function mouseUp(event) {
  player.moving = false;
}

function mouseMove(event) {
  if(player.moving) {
    var mousePos = getMousePos(canvas, event);
    player.destination = camera.getScreenToWorldPos(mousePos.x, mousePos.y);
  }
}

function movePlayer(destination) {
  // coordinates need to be scaled down
  if (distance(player.getPosition(), destination) > DESTINATION_RANGE) {
    var playerPos = player.getPosition();
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

    player.setPosition(newPlayerPos);
    player.updateSprite(destination);
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
  var playerPos = player.getPosition();
  var playerRect = new Rectangle(playerPos.x - (PLAYER_HITBOX_SIZE / 2), playerPos.y - (PLAYER_HITBOX_SIZE / 2), PLAYER_HITBOX_SIZE, PLAYER_HITBOX_SIZE);

  player.availableDir.up = !(map.getTileFromCoordinates(playerRect.left, playerRect.top - COLLISION_CHECK_RANGE) == WALL_TILE ||
                             map.getTileFromCoordinates(playerRect.right, playerRect.top - COLLISION_CHECK_RANGE) == WALL_TILE)
  player.availableDir.down = !(map.getTileFromCoordinates(playerRect.left, playerRect.bottom + COLLISION_CHECK_RANGE) == WALL_TILE ||
                               map.getTileFromCoordinates(playerRect.right, playerRect.bottom + COLLISION_CHECK_RANGE) == WALL_TILE)
  player.availableDir.left = !(map.getTileFromCoordinates(playerRect.left - COLLISION_CHECK_RANGE, playerRect.top) == WALL_TILE ||
                               map.getTileFromCoordinates(playerRect.left - COLLISION_CHECK_RANGE, playerRect.bottom) == WALL_TILE)
  player.availableDir.right = !(map.getTileFromCoordinates(playerRect.right + COLLISION_CHECK_RANGE, playerRect.top) == WALL_TILE ||
                                map.getTileFromCoordinates(playerRect.right + COLLISION_CHECK_RANGE, playerRect.bottom) == WALL_TILE)
}

function checkPlayerPath() {
  var position = player.getPosition();
  var currentTile = player.currentTile;
  var lastTile = player.lastTile;

  if (map.getTileFromCoordinates(position.x, position.y) == PATH_WARNING_TILE) {
    if (currentTile == PATH_SAFE_TILE) {
      enemy.startSpawnTime = (new Date()).getTime();
      enemySpawnId =  setTimeout(function() { playerEnemyInteraction() }, WARNING_TIME);
    }

    player.currentTile = PATH_WARNING_TILE;
  }
  else if (map.getTileFromCoordinates(position.x, position.y) == PATH_DANGER_TILE) {
    if (currentTile == PATH_SAFE_TILE) {
      enemy.startSpawnTime = (new Date()).getTime();
      enemySpawnId =  setTimeout(function() { playerEnemyInteraction() }, DANGER_TIME);
    }
    else if (currentTile == PATH_WARNING_TILE) {
      // get time passed
      var timePassed = (new Date()).getTime() - enemy.startSpawnTime;
      if (timePassed < (WARNING_TIME - DANGER_TIME)) {
        clearTimeout(enemySpawnId);
        enemySpawnId =  setTimeout(function() { playerEnemyInteraction() }, DANGER_TIME);
      }
    }

    player.currentTile = PATH_DANGER_TILE;
  }
  else {
    if (enemySpawnId != null)
      clearTimeout(enemySpawnId);
    player.currentTile = PATH_SAFE_TILE;
  }
}

function playerEnemyInteraction() {
  enemy.spawn(player.getPosition());
  player.takeDamage();
}
