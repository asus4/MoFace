import 'three'
// import THREE extra modules
// DO NOT use yarn instead of npm, since it removes example folder
import 'three/examples/js/shaders/CopyShader'
import 'three/examples/js/shaders/SepiaShader'

import 'three/examples/js/postprocessing/EffectComposer'
import 'three/examples/js/postprocessing/ShaderPass'
import 'three/examples/js/postprocessing/RenderPass'

import assets from './assets'
import CompositePass from './composite-pass'
import Morpher from './morpher'
import VoiceMixer from './voice-mixer'
import config from './config'
import {remap} from './math'

export default class AppMorph {
  /**
   * Creates an instance of AppMorph.
   * @param {element} container 
   * @memberof AppMorph
   */
  constructor() {
    this.canvas = document.querySelector('#main .webgl')
    this.initScene()

    this.mixer = new VoiceMixer(assets.voices, assets.spritemaps)

    this.morpher = new Morpher()
    this.scene.add(this.morpher)

    this.resize()
  }

  initScene() {
    // Scene
    const width = window.innerWidth
    const height = window.innerHeight
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas})
    this.renderer.setSize(width, height)
    this.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -10, 10)
    this.scene = new THREE.Scene()

    // Post effects
    this.composer = new THREE.EffectComposer(this.renderer)
    this.composer.addPass(new THREE.RenderPass(this.scene, this.camera))
    this.composite = new CompositePass()
    this.composer.addPass(this.composite)
    this.composer.passes[this.composer.passes.length - 1].renderToScreen = true
  }

  addFace(img, data) {
    // TODO
    console.warn('TODO implement addFace')
  }

  say(word, pan) {
    this.morpher.fade = pan
    this.mixer.play(word, pan)
  }

  get fade() {
    return this.morpher.fade
  }
  set fade(value) {
    this.mixer.fade = this.morpher.fade = value
    this.morpher.lookX = remap(value, 0, 1, -1, 1)
  }

  setPosition(x, y) {
    this.mixer.fade = this.morpher.fade = x
    // const look = this.morpher.look

    this.morpher.lookX = remap(x, 0, 1, -1, 1)
    this.morpher.lookY = remap(y, 0, 1, -1, 1)
  }

  update() {
    this.composer.render()
    if (this.stats) {
      this.stats.update()
    }
  }

  resize() {
    const width = window.innerWidth
    const height = window.innerHeight

    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.canvas.width = width
    this.canvas.height = height

    // this.camera.aspect = width / height // In case of  PerspectiveCamera
    // In case of OrthographicCamera
    this.camera.left = width / - 2
    this.camera.right = width / 2
    this.camera.top = height / 2
    this.camera.bottom = height / - 2

    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)

    if (width / height < config.aspect) {
      this.morpher.scale.set(height * config.aspect, height, 1)
    } else {
      this.morpher.scale.set(width, width / config.aspect, 1)
    }
  }

  /**
   * Add GUI
   * @param {dat.GUI} gui 
   * @memberof View
   */
  addGui(gui) {
    const morphs = gui.addFolder('morphs')
    morphs.add(this, 'fade', 0.0, 1.0)
    morphs.add(this.morpher, 'wireframe')
    morphs.add(this.morpher, 'fadeMap', { TypeA: 0, TypeB: 1, TypeC: 2 } )
    morphs.add(this.morpher, 'lookX', -1.0, 1.0)
    morphs.add(this.morpher, 'lookY', -1.0, 1.0)
    morphs.add(this.morpher, 'parallax', 0.0, 0.1)

    const effects = gui.addFolder('effects')
    effects.add(this.composite, 'blend', 0, 1)
  }
}
