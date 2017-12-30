import paper from 'paper'
import Delaunay from 'delaunay-fast'

import landmarks from './landmarks'
const _LANDMARKS = Object.values(landmarks)
const _COLOR = '#00FF00' // Green

import headPoints from './head-points'


export default class Editor {
  constructor(canvas) {
    this.canvas = canvas
    paper.setup(canvas)

    this.circles = []
    this.pathes = []
    this.polygons = []

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
      if (d < 10) {
        return circle
      }
    }
    return null
  }

  start(points) {
    const defaultCount = points.length
    const extColor = '#FF00FF' // Purple

    // Add head point
    const head = headPoints(points)
    points.push(...head)

    // Add corner point
    {
      const w = this.canvas.width
      const h = this.canvas.height
      points.push([0, 0], [w, 0], [w, h], [0, h])
    }

    // Add polygons
    {
      const polygonColor = '#0000aa'
      const indexes = Delaunay.triangulate(points)
      for (let i = 0; i < indexes.length; i += 3) {
        const path = new paper.Path()
        path.strokeColor = polygonColor
        path.add(points[indexes[i]])
        path.add(points[indexes[i + 1]])
        path.add(points[indexes[i + 2]])
        path.closed = true
        this.polygons.push(path)
      }
    }

    // Add circles
    this.circles = points.map((p, i) => {
      const c = new paper.Path.Circle(new paper.Point(p[0], p[1]), 5)
      c.strokeColor = i >= defaultCount ? extColor : _COLOR
      return c
    })

    // Add pathes
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


    // Draw polygon
    const pts = this.circles.map((c) => {
      return [c.position.x, c.position.y]
    })
    console.time('Delaunay')
    const indexes = Delaunay.triangulate(pts)
    console.timeEnd('Delaunay')
    this.polygons.forEach((path, i) => {
      path.segments.forEach((segment, j) => {
        const p = pts[indexes[i * 3 + j]]
        segment.point.x = p[0]
        segment.point.y = p[1]
      })
    })
  }

  clear() {
    this.circles = []
    this.pathes = [] // 
  }

  exportPoints() {
    const w = this.canvas.width
    const h = this.canvas.height
    return this.circles.map((circle) => {
      const p = circle.position
      let x = p.x / w
      let y = p.y / h
      // Cutoff 0.000
      x = Math.floor(x * 1000) / 1000
      y = Math.floor(y * 1000) / 1000
      return [x, y]
    })
  }

  exportIndexes() {
    const pts = this.circles.map((c) => {
      return [c.position.x, c.position.y]
    })
    return Delaunay.triangulate(pts)
  }
}
