import paper from 'paper'

const _COLOR = '#00FF00' // Green

export default class Editor {
  constructor(canvas) {
    paper.setup(canvas)

    const tool = new paper.Tool()

    let dragging = null

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

    tool.onMouseUp = (event) => {
      dragging = null
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
    this.points = points.map((p) => {
      return new paper.Point(p[0], p[1])
    })

    this.circles = this.points.map((p) => {
      const c = new paper.Path.Circle(p, 5)
      c.strokeColor = _COLOR
      return c
    })
    console.log(this.circles)

    const path = new paper.Path()
    path.strokeColor = _COLOR

    const start = new paper.Point(100, 100)
    path.moveTo(start)
    path.lineTo(start.add([ 200, -50 ]))
    paper.view.draw()
  }

  clear() {
    this.points = []
    this.circles = []
    this.pathes = []
  }

  save() {
    console.log('TODO onclick saveButton')
  }
}
