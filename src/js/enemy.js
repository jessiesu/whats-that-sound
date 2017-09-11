class Enemy {
  constructor(position) {
    this.position = position;
    this.spriteAsset = createSprite("assets/img/enemy.png");
    this.sprite = { x: 0 * TILE_SIZE, y: 0 * TILE_SIZE }
  }

  spawn(x, y) {
    setPosition({ x: x, y: y })
  }

  setPosition(position) {
    this.position= position;
  }

  getPosition() {
    return this.position;
  }
}
