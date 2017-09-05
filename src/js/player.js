class Player {
  constructor(position, life, speed) {
    this.position = position
    this.life = life;
    this.speed = speed;
    this.moving = false;
    this.destination = position;

    this.spriteAsset = createSprite("assets/img/player.png");
    this.sprite = this.getSpriteTile(90);
  }

  updateSprite(destination) {
    var angleDeg = Math.atan2(destination.y - this.position.y, destination.x -this.position.x) * 180 / Math.PI;
    this.sprite = this.getSpriteTile(angleDeg);
  }

  getSpriteTile(degree) {
    if ((degree > -22.5 && degree <= 0) || (degree < 22.5 && degree >= 0)) {
      return { x: 2 * TILE_SIZE, y: 0 * TILE_SIZE}
    }
    else if (degree >= 22.5 && degree <= 67.5) {
      return { x: 3 * TILE_SIZE, y: 0 * TILE_SIZE}
    }
    else if (degree > 67.5 && degree < 112.5) {
      return { x: 0 * TILE_SIZE, y: 1 * TILE_SIZE}
    }
    else if (degree >= 112.5 && degree <= 157.5) {
      return { x: 1 * TILE_SIZE, y: 1 * TILE_SIZE}
    }
    else if ((degree > 157.5 && degree <= 180) || (degree <= -157.5 && degree >= -180)) {
      return { x: 2 * TILE_SIZE, y: 1 * TILE_SIZE}
    }
    else if (degree >= -157.5 && degree <= -112.5) {
      return { x: 3 * TILE_SIZE, y: 1 * TILE_SIZE}
    }
    else if (degree > -112.5 && degree < -67.5) {
      return { x: 0 * TILE_SIZE, y: 0 * TILE_SIZE}
    }
    else if (degree >= -67.5 && degree <= -22.5) {
      return { x: 1 * TILE_SIZE, y: 0 * TILE_SIZE}
    }

    // default
    return { x: 0 * TILE_SIZE, y: 0 * TILE_SIZE}
  }
}
