import dat from 'dat-gui'

import 'three'

import {loadImageAsync, loadBuffer} from './async'
import Morpher from './morpher'
import Mixer from './mixer'

class App {
  constructor(canvas) {
    const WIDTH = 512
    const HEIGHT = 512
    this.renderer = new THREE.WebGLRenderer({canvas})
    this.camera = new THREE.OrthographicCamera(-WIDTH / 2, WIDTH / 2, HEIGHT / 2, -HEIGHT / 2, -10, 10)
    this.scene = new THREE.Scene()
  }

  setup(images, buffers) {
    // Init visual
    const POINTS = [require('./data/otabe.json'), require('./data/ryuuta.json')]
    for (const points of POINTS) {
      points.push([0, 0], [0.5, 0], [1, 0], [1, 0.5], [1, 1], [1, 0.5], [0, 1], [0, 0.5])
    }
    this.morpher = new Morpher(images, POINTS)
    this.morpher.scale.set(512, 512, 1)
    this.scene.add(this.morpher)

    // Init sound
    this.mixer = new Mixer(buffers)

    // Make GUI
    const gui = new dat.GUI()
    gui.add(this.morpher, 'fade', 0.0, 1.0).onChange((value) => {
      this.mixer.fade = value
    })
    gui.add(this.morpher, 'wireframe')
    gui.add(this.mixer, 'fadeEQ')
    this.morpher.weight.makeGUI(gui)

    requestAnimationFrame(this.update.bind(this))
  }

  update() {
    requestAnimationFrame(this.update.bind(this))
    this.renderer.render(this.scene, this.camera)
  }


  onKey(keycode, isDown) {
    const value = isDown ? 0.0 : 1.0
    switch (keycode) {
      case 32: // space
        this.morpher.fade = value
        break
      case 65: // a
        this.morpher.weight.eyeL = value
        break
      case 83: // a
        this.morpher.weight.eyeR = value
        break
      case 68: // a
        this.morpher.weight.noseUnder = value
        break
      case 70: // a
        this.morpher.weight.mouse = value
        break
      default:
        console.log(keycode)
    }
  }
}

const app = new App( document.querySelector('canvas'))

// Load all images
Promise.all([
  loadImageAsync('data/otabe.jpg'),
  loadImageAsync('data/ryuuta.jpg'),
  loadBuffer('data/otabe.mp3'),
  loadBuffer('data/ryuuta.mp3'),
]).then((assets) => {
  const images = assets.slice(0, 2)
  const buffers = assets.slice(2, 4)
  app.setup(images, buffers)
}).catch((err) => {
  console.error(err)
})


// Events
window.addEventListener('focus', () => {
  Mixer.mute = false
}, false)
window.addEventListener('blur', () => {
  Mixer.mute = true
}, false)
window.addEventListener('keydown', (e) => {
  app.onKey(e.keyCode, true)
}, false)
window.addEventListener('keyup', (e) => {
  app.onKey(e.keyCode, false)
})
