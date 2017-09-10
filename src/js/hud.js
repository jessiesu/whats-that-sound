class Hud {
  constructor(life, canvasWidth, canvasHeight) {
    this.life = life;
    this.maxLife = life;

    this.spriteAsset = createSprite("assets/img/hud.png");

    this.lifeBarRect = new Rectangle(2, 2, TILE_SIZE * life, TILE_SIZE);
  }

  setLife(life) {
    this.life = life;
  }

  getLife() {
    return this.maxLife;
  }

  getMaxLife() {
    return this.maxLife;
  }

  setLifeBarPos(x, y) {
    this.lifeBarRect.set(x, y);
  }

  getLifeBarPos() {
    return { x: this.lifeBarRect.left, y: this.lifeBarRect.top }

  }

  getTileImage(tileName) {
    switch (tileName) {
      case 'life':
        return { x: 0*TILE_SIZE, y: 0*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
      case 'emptyLife':
        return { x: 1*TILE_SIZE, y: 0*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
      default:
        return { x: 0*TILE_SIZE, y: 0*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
    }
  }
}
