import dat from 'dat-gui'
import Tone from 'tone'
import 'three'

import {loadImageAsync, loadBuffer} from './async'
import Morpher from './morpher'
import Mixer from './mixer'

class App {
  constructor(canvas) {
    const WIDTH = 512 * (1920 / 1280)
    const HEIGHT = 512
    this.renderer = new THREE.WebGLRenderer({canvas})
    this.camera = new THREE.OrthographicCamera(-WIDTH / 2, WIDTH / 2, HEIGHT / 2, -HEIGHT / 2, -10, 10)
    this.scene = new THREE.Scene()
  }

  setup(images, buffers) {
    this.morpher = new Morpher(images, [
      require('./data/iwata.json'),
      require('./data/kikuchi.json')])

    this.morpher.scale.set(512 * (1920 / 1280), 512, 1)
    this.scene.add(this.morpher)

    // Init sound
    this.mixer = new Mixer(buffers)

    // Make GUI
    const gui = new dat.GUI()
    gui.add(this.morpher, 'fade', 0.0, 1.0).onChange((value) => {
      this.mixer.fade = value
    })
    gui.add(this.morpher, 'wireframe')
    gui.add(this.morpher, 'fadeMap', { TypeA: 0, TypeB: 1, TypeC: 2 } )
    gui.add(this.morpher, 'lookX', -1.0, 1.0)
    gui.add(this.morpher, 'lookY', -1.0, 1.0)
    gui.add(this.morpher, 'parallax', 0.0, 0.1)
    gui.add(this.mixer, 'fadeEQ')
    // this.morpher.weight.makeGUI(gui)


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
        this.mixer.fade = value
        break
      case 65: // a
        this.morpher.weight.eyeL = value
        break
      case 83: // s
        this.morpher.weight.eyeR = value
        break
      case 68: // d
        this.morpher.weight.noseUnder = value
        break
      case 70: // f
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
  loadImageAsync('data/iwata.jpg'),
  loadImageAsync('data/kikuchi.jpg'),
  loadImageAsync('data/depth.jpg'),
  loadImageAsync('data/morph0.png'),
  loadImageAsync('data/morph1.png'),
  loadImageAsync('data/morph2.png'),
  loadBuffer('data/otabe.mp3'),
  loadBuffer('data/ryuuta.mp3'),
]).then((assets) => {
  const images = assets.filter((a) => {return a instanceof HTMLImageElement})
  const buffers = assets.filter((a) => {return a instanceof Tone.Buffer})
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
