class Camera {
  constructor(xView, yView, canvasWidth, canvasHeight, worldWidth, worldHeight, scale = 1) {
    this.scale = scale

    this.xView = xView
    this.yView = yView

    this.xDeadZone = 0
    this.yDeadZone = 0

    this.wViewPort = canvasWidth / scale
    this.hViewPort = canvasHeight / scale

    this.viewPortRect = new Rectangle(xView, yView, this.wViewPort, this.hViewPort)
    this.worldRect = new Rectangle(0, 0, worldWidth, worldHeight)
  }

  getViewport() {
    return this.viewPortRect
  }

  setDeadZone(xDeadZone, yDeadZone) {
    this.xDeadZone = xDeadZone / this.scale
    this.yDeadZone = yDeadZone / this.scale
  }

  follow(target) {
    this.target = target
  }

  // returns the world position
  getScreenToWorldPos(x, y) {
    x /= this.scale
    y /= this.scale
    return ({
      x: x + this.xView,
      y: y + this.yView
    })
  }

  getWorldToScreenPos(x, y) {
    return ({
      x: x - this.xView,
      y: y - this.yView
    })
  }

  update() {
    var targetPos = this.target.position
    if(targetPos.x - this.xView  + this.xDeadZone > this.wViewPort) {
      this.xView = targetPos.x - (this.wViewPort - this.xDeadZone)
    }
    else if(targetPos.x  - this.xDeadZone < this.xView) {
      this.xView = targetPos.x  - this.xDeadZone
    }


    if(targetPos.y - this.yView + this.yDeadZone > this.hViewPort) {
      this.yView = targetPos.y - (this.hViewPort - this.yDeadZone)
    }
    else if(targetPos.y - this.yDeadZone < this.yView) {
      this.yView = targetPos.y - this.yDeadZone
    }

    this.viewPortRect.set(this.xView, this.yView)

    if(!this.viewPortRect.within(this.worldRect)) {
      if(this.viewPortRect.left < this.worldRect.left) {
        this.xView = this.worldRect.left
      }

      if(this.viewPortRect.top < this.worldRect.top) {
        this.yView = this.worldRect.top
      }

      if(this.viewPortRect.right > this.worldRect.right) {
        this.xView = this.worldRect.right - this.wViewPort
      }
      if(this.viewPortRect.bottom > this.worldRect.bottom) {
        this.yView = this.worldRect.bottom - this.hViewPort
      }

      this.viewPortRect.set(this.xView, this.yView)
    }
  }
}
