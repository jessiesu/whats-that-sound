var canvas;
var ctx;
var player;
var enemy;
var map;
var camera;
var hud;
var enemySpawnId = null;
var sfxLoopId = null;
var inputLocked = false;
var gameState = STATE_INTRO;

var sfx_playerHit = createSFX([3,,0.0707,,0.2685,0.7213,,-0.3051,,,,,,,,,,,1,,,,,0.5]);
var sfx_warning = createSFX([0,,0.1884,,0.0365,0.464,,,,,,,,0.3026,,,,,1,,,0.1,,0.28]);
var sfx_gameOver = createSFX([1,0.2045,0.1804,0.1303,0.62,0.2308,,-0.2527,-0.0312,0.0561,,-0.1611,0.4463,0.0859,0.0137,0.4703,0.7618,0.0148,0.6813,-0.0014,,0.0008,-0.1493,0.5])
var sfx_gameSuccess = createSFX([0,,0.01,0.3592,0.3356,0.729,,,,,,0.5557,0.6239,,,,,,1,,,,,0.5])

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
var WARNING_TIME = 3000;
var DANGER_TIME = 1500;
var STATE_INTRO = 0;
var STATE_PLAY = 1;
var STATE_END = 2;

document.addEventListener("mousedown", mouseDown);
document.addEventListener("mouseup", mouseUp);
document.addEventListener("mousemove", mouseMove);

function startGame() {
  map = new Map(1)
  player = new Player(map.getPlayerStartPos() || { x: 190, y: 60 }, 3, 3 / SCALE);
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
    movePlayer(camera.getScreenToWorldPos(player.destination.x, player.destination.y));
    checkPlayerCollision();
  }

  checkPlayerPath();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap(FLOOR_TILE);
  drawPlayer();
  drawMap(WALL_TILE);
  drawEnemy();

  ctx.fillStyle = '#100';
  ctx.globalAlpha = 0.6;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.globalAlpha = 1;

  drawHUD();
}

function drawLight(x, y, radius, color) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  var radialGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  radialGradient.addColorStop(0.0, '#AA9');
  radialGradient.addColorStop(0.2, '#885');
  radialGradient.addColorStop(0.7, '#220');
  radialGradient.addColorStop(0.95, '#110');
  radialGradient.addColorStop(1, '#000');
  ctx.fillStyle = radialGradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}

function drawPlayer() {
  var position = {};
  position.x = player.getPosition().x - HALF_TILE;
  position.y = player.getPosition().y - HALF_TILE;
  position = camera.getWorldToScreenPos(position.x, position.y)

  drawLight(position.x + HALF_TILE, position.y + HALF_TILE, 30);

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
        ctx.fillRect((j*TILE_SIZE) - viewport.left, ((i*TILE_SIZE) - viewport.top), TILE_SIZE, TILE_SIZE)
      }
      else if (tileType == FLOOR_TILE){
        ctx.drawImage(map.mapAsset, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, TILE_SIZE, (j*TILE_SIZE) - viewport.left, (i*TILE_SIZE) - viewport.top, TILE_SIZE, TILE_SIZE);
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
    if (i < player.life) {
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
  if (!inputLocked) {
    player.moving = true;
    player.destination = getMousePos(canvas, event);
  }
}

function mouseUp(event) {
  player.moving = false;
}

function mouseMove(event) {
  if(!inputLocked && player.moving) {
    player.destination = getMousePos(canvas, event);;
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

function createSFX(soundURL) {
  var audio = new Audio();
  audio.src = jsfxr(soundURL);
  return audio;
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
      if (!sfxLoopId) {
        sfxLoopId = setInterval(function() { playWarningLoop(500 / WARNING_TIME) }, 500);
      }
    }

    player.currentTile = PATH_WARNING_TILE;
  }
  else if (map.getTileFromCoordinates(position.x, position.y) == PATH_DANGER_TILE) {
    if (currentTile == PATH_SAFE_TILE) {
      enemy.startSpawnTime = (new Date()).getTime();
      enemySpawnId =  setTimeout(function() { playerEnemyInteraction() }, DANGER_TIME);
      if (!sfxLoopId)
        sfxLoopId = setInterval(function() { playWarningLoop(300 / DANGER_TIME) }, 300);
    }
    else if (currentTile == PATH_WARNING_TILE) {
      // get time passed
      var timePassed = (new Date()).getTime() - enemy.startSpawnTime;
      if (timePassed < (WARNING_TIME - DANGER_TIME)) {
        clearTimeout(enemySpawnId);
        enemySpawnId =  setTimeout(function() { playerEnemyInteraction() }, DANGER_TIME);
      }

      clearInterval(sfxLoopId);
      sfxLoopId = null;
      sfxLoopId = setInterval(function() { playWarningLoop(300 / DANGER_TIME) }, 300)
    }

    player.currentTile = PATH_DANGER_TILE;
  }
  else if (map.getTileFromCoordinates(position.x, position.y) == EXIT_TILE && gameState == STATE_PLAY) {
    gameEnd(true);

  }
  else {
    clearTimeout(enemySpawnId);
    clearInterval(sfxLoopId);
    sfxLoopId = null;
    player.currentTile = PATH_SAFE_TILE;
    sfx_warning.volume = 0;
  }
}

function playerEnemyInteraction() {
  enemy.spawn(player.getPosition());
  player.takeDamage();
  sfx_playerHit.play();
  clearInterval(sfxLoopId);
  sfx_warning.volume = 0;

  if (player.life == 0) {
    gameEnd(false)

  }
}

function playWarningLoop(volumeStep) {
  sfx_warning.play();
  if ((sfx_warning.volume + volumeStep) >= 1)
    sfx_warning.volume = 1;
  else
    sfx_warning.volume += volumeStep;
}

function gameEnd(success) {
  lockInput(true)

  gameState = STATE_END;

  if (success) {
    sfx_gameSuccess.play();
  }
  else {
    setTimeout(function() { sfx_gameOver.play() }, 500)
    setTimeout(function() { restartGame() }, 500)
  }
}

function restartGame() {
  player.life = player.maxLife
  player.position = map.getPlayerStartPos()
  player.destination = null;
  sfx_warning.volume = 0;
  lockInput(false)
  gameState = STATE_PLAY
}

function lockInput(lock) {
  inputLocked = lock;
  player.moving = false;
}
