class Hud {
  constructor(life, canvasWidth, canvasHeight) {
    this.life = life
    this.spriteAsset = createSprite("assets/img/hud.png")

    this.lifeBarRect = new Rectangle(2, 2, TILE * life, TILE)

    this.ctx = ctx
  }

  getLifeBarPos() {
    return { x: this.lifeBarRect.left, y: this.lifeBarRect.top }
  }

  getTileImage(tileName) {
    switch (tileName) {
      case 'life':
        return { x: 0*TILE, y: 0*TILE, width: TILE, height: TILE }
      case 'emptyLife':
        return { x: 1*TILE, y: 0*TILE, width: TILE, height: TILE }
      default:
        return { x: 0*TILE, y: 0*TILE, width: TILE, height: TILE }
    }
  }
}
