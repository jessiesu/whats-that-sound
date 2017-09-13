var FLOOR_TILE = 1
var WALL_TILE = null
var PLAYER_START = 5
var PATH_SAFE_TILE = 2
var EXIT_TILE = 4
var PATH_WARNING_TILE = 6
var PATH_DANGER_TILE = 7

class Map {
  constructor(level) {
    this.level = level
    this.mapAsset = createSprite("assets/img/sprites.png")

    this.data = level_1

    this.height = this.data.length
    this.width = this.data[0].length
    this.playerPos = null

    this.initialize()
  }

  getTileFromCoordinates(x, y) {
    if (x < 0 || y < 0 ||
      x > this.width * TILE_SIZE || y > this.height * TILE_SIZE) {
      return WALL_TILE
    }
    // returns the tile type on the given coordinate
    var colIndex = Math.floor(x / TILE_SIZE)
    var rowIndex = Math.floor(y / TILE_SIZE)
    return this.data[rowIndex][colIndex]
  }

  getTileImage(tileName) {
    switch (tileName) {
      case 'grass':
        return { x: 0*TILE_SIZE, y: 0*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }
      case 'wall':
        return { x: 3*TILE_SIZE, y: 0*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE * 2 }
      default:
        // return a wall by default
        return { x: 1*TILE_SIZE, y: 1*TILE_SIZE }
    }
  }

  setPlayerStartPos(position) {
    this.playerPos = position
  }

  getPlayerStartPos() {
    return this.playerPos
  }

  initialize() {
    for(var i = 0; i < this.height; i++) {
      for(var j = 0; j < this.width; j++) {
        if (this.data[i][j] == PLAYER_START && this.getPlayerStartPos() == null) {
          this.setPlayerStartPos({ x: j*TILE_SIZE, y: i*TILE_SIZE })
        }
      }
    }
  }
}
