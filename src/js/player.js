class Player {
  constructor(position, life, speed) {
    this.startPos = position
    this.position = position
    this.maxLife = life
    this.life = life
    this.speed = speed
    this.moving = false
    this.destination = position
    this.availableDir = {
      up: true,
      down: true,
      left: true,
      right: true
    }

    this.spriteAsset = createSprite("assets/img/sprites.png")
    this.sprite = this.getSpriteTile(90)
    this.currentTile = SAFE_TILE
    this.lastTile = SAFE_TILE
  }

  takeDamage() {
    if (this.life > 0) {
      this.life--
    }
  }

  updateSprite(destination) {
    var angleDeg = Math.atan2(destination.y - this.position.y, destination.x -this.position.x) * 180 / Math.PI
    this.sprite = this.getSpriteTile(angleDeg)
  }

  getSpriteTile(degree) {
    // right
    if ((degree > -67.5 && degree <= 0) || (degree <= 67.5 && degree >= 0)) {
      return { x: 3 * TILE, y: 0 * TILE}
    }
    // bottom
    else if (degree > 67.5 && degree <= 157.5) {
      return { x: 1 * TILE, y:0 * TILE}
    }
    // left
    else if ((degree > 157.5 && degree <= 180) || (degree <= -112.5 && degree >= -180)) {
      return { x: 2 * TILE, y: 0 * TILE}
    }
    // top
    else if (degree > -112.5 && degree <= -22.5) {
      return { x: 0 * TILE, y: 0 * TILE}
    }

    // default
    return { x: 0 * TILE, y: 0 * TILE}
  }
}
