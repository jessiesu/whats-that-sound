var GRASS_TILE = 3;
var WALL_TILE = 1;
var PATH_SAFE_TILE = 2;
var PATH_WARNING_TILE = 6;
var PATH_DANGER_TILE = 7;

class Map {
  constructor(level) {
    this.level = level;
    this.mapAsset = createSprite("assets/img/map.png");

    this.data = level_1;

    this.height = this.data.length;
    this.width = this.data[0].length;
  }

  getTileFromCoordinates(x, y) {
    if (x < 0 || y < 0 ||
      x > this.width * TILE_SIZE || y > this.height * TILE_SIZE) {
      return WALL_TILE;
    }
    // returns the tile type on the given coordinate
    var colIndex = Math.floor(x / TILE_SIZE);
    var rowIndex = Math.floor(y / TILE_SIZE);
    return this.data[rowIndex][colIndex];
  }
}
