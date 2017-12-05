import dat from 'dat-gui'
import 'three'

import {loadImageAsync} from './async'
import Morpher from './morpher'



const WIDTH = 512
const HEIGHT = 512
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector('canvas')})
const camera = new THREE.OrthographicCamera(-WIDTH / 2, WIDTH / 2, HEIGHT / 2, -HEIGHT / 2, -10, 10)
const scene = new THREE.Scene()

function setup(images) {
  const POINTS = [require('../public/data/otabe.json'), require('../public/data/ryuuta.json')]
  for (const points of POINTS) {
    points.push([0, 0], [0.5, 0], [1, 0], [1, 0.5], [1, 1], [1, 0.5], [0, 1], [0, 0.5])
  }

  const morpher = new Morpher(images, POINTS)
  morpher.scale.set(512, 512, 1)
  scene.add(morpher)

  const gui = new dat.GUI()
  gui.add(morpher, 'fade', 0.0, 1.0)
  gui.add(morpher, 'wireframe')

  requestAnimationFrame(update)
}


function update() {
  requestAnimationFrame(update)
  renderer.render(scene, camera)
}

// Load all images
Promise.all([loadImageAsync('data/otabe.jpg'), loadImageAsync('data/ryuuta.jpg')]).then((images) => {
  setup(images)
}).catch((err) => {
  console.error(err)
})
