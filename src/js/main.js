var SCALE = 8
var TILE = 16
var HALF_TILE = TILE / 2
var MAP_SIZE_X = 20
var MAP_SIZE_Y = 20
var PLAYER_HITBOX = 12
var COLLISION_RANGE = 2
var DESTINATION_RANGE = 5
var CANVAS_W = 60 * TILE
var CANVAS_H = 40 * TILE
var OFFSCREEN = { x: -100, y: -100 }
var WARNING_TIME = 3000
var DANGER_TIME = 2000
var STATE_INTRO = 0
var STATE_TUTORIAL = 1
var STATE_PLAY = 2
var STATE_END = 3
var STATE_OUTRO = 4

var canvas
var ctx
var player
var enemy
var map
var camera
var hud
var enemySpawnId = null
var sfxLoopId = null
var inputLocked = false
var gameState = STATE_INTRO
var timer = 0
var timerId = null

var sfx_playerHit = createSFX([3,,0.0707,,0.2685,0.7213,,-0.3051,,,,,,,,,,,1,,,,,0.5])
var sfx_warning = createSFX([0,,0.1884,,0.0365,0.464,,,,,,,,0.3026,,,,,1,,,0.1,,0.28])
var sfx_gameOver = createSFX([1,0.2045,0.1804,0.1303,0.62,0.2308,,-0.2527,-0.0312,0.0561,,-0.1611,0.4463,0.0859,0.0137,0.4703,0.7618,0.0148,0.6813,-0.0014,,0.0008,-0.1493,0.5])
var sfx_gameSuccess = createSFX([0,,0.01,0.3592,0.3356,0.729,,,,,,0.5557,0.6239,,,,,,1,,,,,0.5])

document.addEventListener("mousedown", mouseDown)
document.addEventListener("mouseup", mouseUp)
document.addEventListener("mousemove", mouseMove)

function startGame() {
  map = new Map(1)
  player = new Player(map.playerPos || { x: 190, y: 60 }, 3, 2.5 / SCALE)
  enemy = new Enemy(OFFSCREEN)
  camera = new Camera(0, 0, CANVAS_W, CANVAS_H, map.width * TILE, map.height * TILE, SCALE)
  camera.setDeadZone(CANVAS_W / 2, CANVAS_H / 2)
  camera.follow(player)
  hud = new Hud(player.life, CANVAS_W, CANVAS_H)

  canvas = document.getElementById('gameCanvas')
  canvas.width = CANVAS_W
  canvas.height = CANVAS_H
  ctx = canvas.getContext('2d')
  ctx.scale(SCALE,SCALE)
  ctx.mozImageSmoothingEnabled = false
  ctx.imageSmoothingEnabled = false

  setInterval(update, 10)

  lockInput(true)
}

function update() {
  camera.update()
  draw()

  if(player.moving) {
    movePlayer(camera.getScreenToWorldPos(player.destination.x, player.destination.y))
    checkPlayerCollision()
  }

  checkPlayerPath()
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  drawMap(WALL_TILE)

  drawPlayer()
  ctx.fillStyle = '#100'
  ctx.globalAlpha = 0.6
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
  ctx.globalAlpha = 1
  drawEnemy()

  drawHUD()
  if (gameState == STATE_INTRO) {
    drawIntro()
  }
  else if (gameState == STATE_TUTORIAL) {
    drawTutorial()
  }
  else if (gameState == STATE_OUTRO) {
    drawOutro()
  }
}

function drawIntro() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  ctx.fillStyle = '#FFF'
  ctx.font = '5px Courier New'
  ctx.textAlign="center"
  ctx.fillText('You find yourself lost in', 60, 10 )
  ctx.fillText('a haunted dungeon. They\'ve taken', 60, 18 )
  ctx.fillText('away your powers. You must', 60, 26 )
  ctx.fillText('find and retrieve your staff.', 60, 34)
  ctx.fillText('But wait...', 60, 45)
  ctx.font = 'bold 6px Courier New'
  ctx.fillText('What\'s that sound?!', 60, 55)

  ctx.font = '3px Courier New'
  ctx.fillText('click to continue', 60, 65)
}

function drawTutorial() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
  ctx.drawImage(map.mapAsset, 1 * TILE, 1 * TILE, TILE, TILE, 55, 55 , TILE / 2, TILE / 2)
  ctx.fillStyle = '#FFF'
  ctx.font = '5px Courier New'
  ctx.textAlign="center"
  ctx.font = 'bold 6px Courier New'
  ctx.fillText('Click and hold', 60, 10 )
  ctx.fillText('the mouse to move.', 60, 18 )
  ctx.font = '5px Courier New'
  ctx.fillText('The ghost in  here does not want', 60, 26 )
  ctx.fillText('you in certain areas. You have a ', 60, 34 )
  ctx.fillText('ring that warns you of danger.', 60, 42)
  ctx.fillText('Listen to it and go find your staff.', 60, 50)

  ctx.font = '3px Courier New'
  ctx.fillText('click to continue', 60, 68)
}

function drawOutro() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
  ctx.drawImage(map.mapAsset, 1 * TILE, 1 * TILE, TILE, TILE, 50, 45 , TILE, TILE)

  ctx.fillStyle = '#FFF'
  ctx.font = '5px Courier New'
  ctx.textAlign="center"
  ctx.font = 'bold 6px Courier New'
  ctx.fillText('Congratulations!', 60, 20 )
  ctx.font = '5px Courier New'
  ctx.fillText('You found your staff in', 60, 28 )
  ctx.fillText(timer + ' seconds and', 60, 36 )
  ctx.fillText('survived the dungeon!', 60, 42 )

  ctx.font = '3px Courier New'
  ctx.fillText('click to play again', 60, 68)
}

function drawLight(x, y, radius, color) {
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  var radialGradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
  radialGradient.addColorStop(0.0, '#AA9')
  radialGradient.addColorStop(0.2, '#885')
  radialGradient.addColorStop(0.7, '#220')
  radialGradient.addColorStop(0.95, '#110')
  radialGradient.addColorStop(1, '#000')
  ctx.fillStyle = radialGradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.fill()
  ctx.restore()
}

function drawPlayer() {
  var position = {}
  position.x = player.position.x - HALF_TILE
  position.y = player.position.y - HALF_TILE
  position = camera.getWorldToScreenPos(position.x, position.y)

  drawLight(position.x + HALF_TILE, position.y + HALF_TILE, 30)

  ctx.drawImage(player.spriteAsset, player.sprite.x, player.sprite.y, TILE, TILE, position.x, position.y, TILE, TILE)
}

function drawMap(tileType) {

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  var wall = { x: 3*TILE, y: 0*TILE }
  var win = { x: 1*TILE, y: 1*TILE }

  var viewport = camera.getViewport()
  // draw only visible tiles
  var startCol = clamp(Math.floor(viewport.left / TILE) - 1, 0, map.width)
  var startRow = clamp(Math.floor(viewport.top / TILE) - 1, 0, map.height)
  var endCol = clamp(Math.ceil(viewport.right / TILE) + 1, 0, map.width)
  var endRow = clamp(Math.ceil(viewport.bottom / TILE) + 1, 0, map.height)

  for(var i = startRow; i < endRow; i++) {
    for(var j = startCol; j < endCol; j++) {
      if (map.data[i][j] == WIN_TILE) {
        ctx.drawImage(map.mapAsset, 2 * TILE, TILE, TILE, TILE, (j*TILE) - viewport.left, (i*TILE) - viewport.top, TILE, TILE)
        ctx.drawImage(map.mapAsset, 1 * TILE, 1 * TILE, TILE, TILE, (j*TILE) - viewport.left, (i*TILE) - viewport.top, TILE, TILE)
      }
      else if (map.data[i][j] != WALL_TILE) {
        ctx.drawImage(map.mapAsset, 2 * TILE, TILE, TILE, TILE, (j*TILE) - viewport.left, (i*TILE) - viewport.top, TILE, TILE)
      }
    }
  }
}

function drawEnemy() {
  var position = camera.getWorldToScreenPos(enemy.position.x - HALF_TILE, enemy.position.y - HALF_TILE)
  ctx.drawImage(enemy.spriteAsset, enemy.sprite.x, enemy.sprite.y, TILE, TILE, position.x, position.y, TILE, TILE)
}

function drawHUD() {
  var life = hud.getTileImage('life')
  var emptyLife = hud.getTileImage('emptyLife')
  var lifeBarPos = hud.getLifeBarPos()
  for (var i = 0; i < player.maxLife; i++) {
    if (i < player.life) {
      ctx.drawImage(hud.spriteAsset, life.x, life.y, life.width, life.height, lifeBarPos.x + (i * TILE / 2), lifeBarPos.y, life.width / 2, life.height / 2)
    }
    else {
      ctx.drawImage(hud.spriteAsset, emptyLife.x, emptyLife.y, emptyLife.width, emptyLife.height, lifeBarPos.x + (i * TILE / 2), lifeBarPos.y, emptyLife.width / 2, emptyLife.height / 2)
    }
  }

  ctx.fillStyle = '#FFF'
  ctx.font = '5px Courier New'
  ctx.textAlign="right"
  ctx.fillText(timer, lifeBarPos.x + camera.wViewPort - 5, lifeBarPos.y + 5 )
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num
}

// Input
function mouseDown(event) {
  if (!inputLocked) {
    player.moving = true
    player.destination = getMousePos(canvas, event)
  }

  if (gameState == STATE_INTRO) {
    gameState = STATE_TUTORIAL
  }
  else if (gameState == STATE_TUTORIAL) {
    gameState = STATE_PLAY
    lockInput(false)
    if (timerId != null)
      clearInterval(timerId)
    timerId = setInterval(function() { timer++ }, 1000)
  }
  else if (gameState == STATE_OUTRO) {
    setTimeout(function() { restartGame() }, 500)
  }
}

function mouseUp(event) {
  player.moving = false
}

function mouseMove(event) {
  if (gameState != STATE_PLAY)
    return
  if(!inputLocked && player.moving) {
    player.destination = getMousePos(canvas, event)
  }
}

function movePlayer(destination) {
  // coordinates need to be scaled down
  if (distance(player.position, destination) > DESTINATION_RANGE) {
    var playerPos = player.position
    var delta = subtract(destination, playerPos)

    var xReached = Math.abs(delta.x) < DESTINATION_RANGE
    var yReached = Math.abs(delta.y) < DESTINATION_RANGE

    if ((!player.availableDir.up && delta.y < 0) || (!player.availableDir.down && delta.y > 0) || yReached) {
      delta.y = 0
    }
    if ((!player.availableDir.left && delta.x < 0) || (!player.availableDir.right && delta.x > 0) || xReached) {
      delta.x = 0
    }

    var norm = normalize(delta)
    var newPlayerPos = add(playerPos, multiply(norm, player.speed))

    player.position = newPlayerPos
    player.updateSprite(destination)
  }
}

function getMousePos(canvas, event) {
  var rect = canvas.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

function createSprite(src) {
  var sprite = new Image()
  sprite.src = src
  sprite.context = ctx
  sprite.width = TILE
  sprite.height = TILE

  return sprite
}

function createSFX(soundURL) {
  var audio = new Audio()
  audio.src = jsfxr(soundURL)
  return audio
}

function checkPlayerCollision() {
  var playerPos = player.position
  var playerRect = new Rectangle(playerPos.x - (PLAYER_HITBOX / 2), playerPos.y - (PLAYER_HITBOX / 2), PLAYER_HITBOX, PLAYER_HITBOX)

  player.availableDir.up = !(map.getTileFromCoordinates(playerRect.left, playerRect.top - COLLISION_RANGE) == WALL_TILE ||
                             map.getTileFromCoordinates(playerRect.right, playerRect.top - COLLISION_RANGE) == WALL_TILE)
  player.availableDir.down = !(map.getTileFromCoordinates(playerRect.left, playerRect.bottom + COLLISION_RANGE) == WALL_TILE ||
                               map.getTileFromCoordinates(playerRect.right, playerRect.bottom + COLLISION_RANGE) == WALL_TILE)
  player.availableDir.left = !(map.getTileFromCoordinates(playerRect.left - COLLISION_RANGE, playerRect.top) == WALL_TILE ||
                               map.getTileFromCoordinates(playerRect.left - COLLISION_RANGE, playerRect.bottom) == WALL_TILE)
  player.availableDir.right = !(map.getTileFromCoordinates(playerRect.right + COLLISION_RANGE, playerRect.top) == WALL_TILE ||
                                map.getTileFromCoordinates(playerRect.right + COLLISION_RANGE, playerRect.bottom) == WALL_TILE)
}

function checkPlayerPath() {
  var position = player.position
  var currentTile = player.currentTile
  var lastTile = player.lastTile

  if (map.getTileFromCoordinates(position.x, position.y) == WARNING_TILE) {
    if (currentTile == SAFE_TILE) {
      enemy.startSpawnTime = (new Date()).getTime()

      enemySpawnId =  setTimeout(function() { playerEnemyInteraction() }, WARNING_TIME)
      if (!sfxLoopId) {
        sfxLoopId = setInterval(function() { playWarningLoop(500 / WARNING_TIME) }, 500)
      }
    }

    player.currentTile = WARNING_TILE
  }
  else if (map.getTileFromCoordinates(position.x, position.y) == DANGER_TILE) {
    if (currentTile == SAFE_TILE) {
      enemy.startSpawnTime = (new Date()).getTime()
      enemySpawnId =  setTimeout(function() { playerEnemyInteraction() }, DANGER_TIME)
      if (!sfxLoopId)
        sfxLoopId = setInterval(function() { playWarningLoop(300 / DANGER_TIME) }, 300)
    }
    else if (currentTile == WARNING_TILE) {
      // get time passed
      var timePassed = (new Date()).getTime() - enemy.startSpawnTime
      if (timePassed <= (WARNING_TIME - DANGER_TIME)) {
        clearTimeout(enemySpawnId)
        enemySpawnId =  setTimeout(function() { playerEnemyInteraction() }, DANGER_TIME)

        clearInterval(sfxLoopId)
        sfxLoopId = null
        sfxLoopId = setInterval(function() { playWarningLoop(300 / DANGER_TIME) }, 300)
      }

      if (enemySpawnId == null) {
        enemySpawnId = setTimeout(function() { playerEnemyInteraction() }, DANGER_TIME)
      }
    }

    player.currentTile = DANGER_TILE
  }
  else if (map.getTileFromCoordinates(position.x, position.y) == WIN_TILE && gameState == STATE_PLAY) {
    gameEnd(true)
  }
  else {
    clearTimeout(enemySpawnId)
    enemySpawnId = null;
    clearInterval(sfxLoopId)
    sfxLoopId = null
    player.currentTile = SAFE_TILE
    sfx_warning.volume = 0
  }
}

function playerEnemyInteraction() {
  enemy.spawn(player.position)
  player.takeDamage()
  sfx_playerHit.play()
  clearInterval(sfxLoopId)
  sfx_warning.volume = 0

  if (player.life == 0) {
    gameEnd(false)
  }
}

function playWarningLoop(volumeStep) {
  sfx_warning.play()
  if ((sfx_warning.volume + volumeStep) >= 1)
    sfx_warning.volume = 1
  else
    sfx_warning.volume += volumeStep
}

function gameEnd(success) {
  lockInput(true)

  gameState = STATE_END

  if (success) {
    sfx_gameSuccess.play()
    setTimeout(function() { gameState = STATE_OUTRO }, 500)
  }
  else {
    setTimeout(function() { sfx_gameOver.play() }, 500)
    setTimeout(function() { restartGame() }, 500)
  }
}

function restartGame() {
  if (timerId != null)
    clearInterval(timerId)
  timer = 0;
  player.life = player.maxLife
  player.position = map.playerPos
  player.destination = null
  sfx_warning.volume = 0
  lockInput(false)
  gameState = STATE_PLAY
  timerId = setInterval(function() { timer++ }, 1000)
}

function lockInput(lock) {
  inputLocked = lock
  player.moving = false
}
