var ZERO_VECTOR = {
  x: 0,
  y: 0
}

// distance between two vectors
function distance(v1, v2) {
  var a = v1.x - v2.x
  var b = v1.y - v2.y

  return Math.sqrt( a*a + b*b )
}

function magnitude(v) {
  return distance(ZERO_VECTOR, v)
}

function normalize(v) {
  var mag = magnitude(v)
  if(mag > 0) {
    return divide(v, mag)
  }
  return v
}

function subtract(v1, v2) {
  return {
    x: v1.x - v2.x,
    y: v1.y - v2.y
  }
}

function add(v1, v2) {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y
  }
}

function multiply(v, scalar) {
  return {
    x: v.x * scalar,
    y: v.y * scalar
  }
}

function divide(v, scalar) {
  return {
    x: v.x / scalar,
    y: v.y / scalar
  }
}
