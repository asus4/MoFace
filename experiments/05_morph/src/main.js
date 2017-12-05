import dat from 'dat-gui'
import Tone from 'tone'
import 'three'

import {loadImageAsync, loadBuffer} from './async'
import Morpher from './morpher'


const WIDTH = 512
const HEIGHT = 512
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector('canvas')})
const camera = new THREE.OrthographicCamera(-WIDTH / 2, WIDTH / 2, HEIGHT / 2, -HEIGHT / 2, -10, 10)
const scene = new THREE.Scene()

function lerpVolume(start, end, value) {
  // Apply to EXPO easing function
  value = Math.pow( 2, 10 * (value - 1))
  return start * value + end * (1 - value)
}

function setup(images, buffers) {
  // Init visual
  const POINTS = [require('../public/data/otabe.json'), require('../public/data/ryuuta.json')]
  for (const points of POINTS) {
    points.push([0, 0], [0.5, 0], [1, 0], [1, 0.5], [1, 1], [1, 0.5], [0, 1], [0, 0.5])
  }
  const morpher = new Morpher(images, POINTS)
  morpher.scale.set(512, 512, 1)
  scene.add(morpher)

  // Init sound
  const players = buffers.map((buf) => {
    return new Tone.Player(buf)
  })
  players.forEach((player) => {
    player.loop = true
    player.toMaster()
    player.start()
  })

  const gui = new dat.GUI()
  gui.add(morpher, 'fade', 0.0, 1.0).onChange((value) => {
    players[0].volume.value = lerpVolume(-30, 0, value)
    players[1].volume.value = lerpVolume(-30, 0, 1 - value)
  })
  gui.add(morpher, 'wireframe')


  requestAnimationFrame(update)
}


function update() {
  requestAnimationFrame(update)
  renderer.render(scene, camera)
}

// Load all images
Promise.all([
  loadImageAsync('data/otabe.jpg'),
  loadImageAsync('data/ryuuta.jpg'),
  loadBuffer('data/otabe.mp3'),
  loadBuffer('data/ryuuta.mp3'),
]).then((assets) => {
  const images = assets.slice(0, 2)
  const buffers = assets.slice(2, 4)
  console.log(buffers)
  setup(images, buffers)
}).catch((err) => {
  console.error(err)
})
