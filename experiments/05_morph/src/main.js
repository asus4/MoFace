import dat from 'dat-gui'
import Delaunay from 'delaunay-fast'
import {loadImageAsync} from './aync'

const POINTS = [require('../public/data/otabe.json'), require('../public/data/ryuuta.json')]
const WIDTH = 512
const HEIGHT = 512

const gui = new dat.GUI()
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')


function setup(images) {
  const points = POINTS[0]
  points.push([0, 0], [1, 0], [1, 1], [0, 1])
  const tris = Delaunay.triangulate(points)
  console.log(tris)

  ctx.drawImage(images[0], 0, 0, 1024, 1024, 0, 0, WIDTH, HEIGHT)

  // Green

  // Draw points
  ctx.lineWidth = 1
  ctx.strokeStyle = '#00FF00'
  ctx.beginPath()
  for (const p of points) {
    ctx.moveTo(p[0] * WIDTH, p[1] * HEIGHT)
    ctx.arc(p[0] * WIDTH, p[1] * HEIGHT, 2, 0, 2 * Math.PI)
  }
  ctx.stroke()
  ctx.strokeStyle = '#0000FF'

  // Draw lines
  ctx.beginPath()
  let n = 0
  for (const i of tris) {
    let p = points[i]
    p = [p[0] * WIDTH, p[1] * HEIGHT]
    if (n % 3 == 0) {
      ctx.moveTo(p[0], p[1])
    } else {
      ctx.lineTo(p[0], p[1])
    }
    n++
  }
  ctx.stroke()

  requestAnimationFrame(update)
}


function update() {
  requestAnimationFrame(update)
}


// Load all images
Promise.all([loadImageAsync('data/otabe.jpg'), loadImageAsync('data/ryuuta.jpg')]).then((images) => {
  setup(images)
}).catch((err) => {
  console.error(err)
})
