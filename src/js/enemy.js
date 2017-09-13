class Enemy {
  constructor(position, onscreenTime = 200) {
    this.position = position
    this.spriteAsset = createSprite("assets/img/sprites.png")
    this.sprite = { x: 0 * TILE_SIZE, y: 1 * TILE_SIZE }
    this.startSpawnTime = null
    this.onscreenTime = onscreenTime
    this.hideId = null
  }

  spawn(position) {
    this.position = position
    var that = this
    this.hideId = setTimeout(function() { that.hide() }, this.onscreenTime)
  }

  hide() {
    this.position = OFFSCREEN
  }
}
