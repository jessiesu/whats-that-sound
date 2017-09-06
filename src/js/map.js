class Map {
  constructor(level) {
    this.level = level;
    this.mapAsset = createSprite("assets/img/map.png");

    this.data = level_1;

    this.height = this.data.length;
    this.width = this.data[0].length;
  }

}
