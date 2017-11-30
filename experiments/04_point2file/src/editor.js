import paper from 'paper'

const _COLOR = '#00FF00' // Green

const _OUTLINES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
const _EYEBROW_L = [15, 16, 17, 18]
const _EYEBROW_R = [19, 20, 21, 22]
const _EYE_R = [23, 63, 24, 64, 25, 65, 26, 66, 23]
const _EYE_L = [30, 68, 29, 67, 28, 70, 31, 69, 30]
const _NOSE_CENTER = [33, 41, 62]
const _NOSE_UNDER = [34, 35, 36, 42, 37, 43, 38, 39, 40]
const _MOUSE = [44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 44, 56, 57, 58, 50, 59, 60, 61, 44]
const _LANDMARKS = [
  _OUTLINES,
  _EYEBROW_L,
  _EYEBROW_R,
  _EYE_L,
  _EYE_R,
  _NOSE_CENTER,
  _NOSE_UNDER,
  _MOUSE
]

const SIZE = 512


export default class Editor {
  constructor(canvas) {
    paper.setup(canvas)

    let dragging = null
    const tool = new paper.Tool()
    tool.onMouseDown = (event) => {
      const cursor = event.point
      const circle = this.findCircle(cursor)
      if (circle) {
        dragging = circle
        circle.position = event.point
      }
    }

    tool.onMouseDrag = (event) => {
      if (dragging) {
        dragging.position = event.point
      }
    }

    tool.onMouseUp = () => {
      dragging = null
      this.redraw()
    }
  }

  findCircle(target) {
    for (const circle of this.circles) {
      const d = circle.position.getDistance(target)
      if (d < 5) {
        return circle
      }
    }
    return null
  }

  start(points) {
    this.circles = points.map((p) => {
      const c = new paper.Path.Circle(new paper.Point(p[0], p[1]), 3)
      c.strokeColor = _COLOR
      return c
    })

    this.pathes = []
    for (const landmark of _LANDMARKS) {
      const path = new paper.Path()
      path.strokeColor = _COLOR
      for (const index of landmark) {
        path.add(this.circles[index].position)
      }
      this.pathes.push(path)
    }
  }

  redraw() {
    this.pathes.forEach((path, i) => {
      const landmark = _LANDMARKS[i]
      path.segments.forEach((segment, j) => {
        const index = landmark[j]
        segment.point = this.circles[index].position
      })
    })
  }

  clear() {
    this.circles = []
    this.pathes = [] // 
  }

  export() {
    return this.circles.map((circle) => {
      const p = circle.position
      let x = p.x / SIZE
      let y = p.y / SIZE
      // Cutoff 0.000
      x = Math.floor(x * 1000) / 1000
      y = Math.floor(y * 1000) / 1000
      return [x, y]
    })
  }
}
