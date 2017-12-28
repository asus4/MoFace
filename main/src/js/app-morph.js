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
import VirtualKeyboard from './virtual-keyboard'
import KanaIME from './kana-ime'


export default class AppMorph {
  /**
   * Creates an instance of AppMorph.
   * @param {element} container 
   * @memberof AppMorph
   */
  constructor() {
    this.canvas = document.querySelector('#main .webgl')
    this.morphers = []

    this.initScene()
    this.resize()

    // Morph Parameter
    this.morphs = assets.buffers.map(() => {return 1})
    this.morphs.push(1) // user channel

    for (const img of assets.images) {
      this.addFace(img, null)
    }

    this.mixer = new VoiceMixer(assets.buffers, assets.spritemaps)
    const keyboard = new VirtualKeyboard(document.querySelector('#main .ui'))
    keyboard.on('key', (input, pan) => {
      if (!this.speakMode) {
        console.log('ignore key:', input, pan)
        return
      }
      console.log('on key:', input, pan)
      this.mixer.play(input, pan)
    })
    const ime = new KanaIME(document.getElementById('kana-input'))


    this.isSpeakMode = true
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
    const morpher = new Morpher(img, data)
    this.scene.add(morpher)
    this.morphers.push(morpher)
  }

  update() {
    this.composer.render()
    if (this.stats) {
      this.stats.update()
    }
  }

  updateMorph() {
    this.morphers.forEach((m, i) => {
      m.morph = this.morphs[i]
    })
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
  }

  /**
   * Add GUI
   * @param {dat.GUI} gui 
   * @memberof View
   */
  addGui(gui) {
    const morphs = gui.addFolder('morphs')
    for (let i = 0; i < this.morphs.length; ++i) {
      morphs.add(this.morphs, i, 0.0, 1.0).name(`morph ${i}`).onChange(() => {
        this.updateMorph()
      })
    }

    const effects = gui.addFolder('other')
    effects.add(this.composite, 'blend', 0, 1)
  }

  get isSpeakMode() {
    return this.speakMode
  }
  set isSpeakMode(value) {
    const cl = document.documentElement.classList
    const modeInfo = document.querySelector('#mode-button span')
    if (value) {
      cl.add('speak-mode')
      cl.remove('text-mode')
      modeInfo.innerHTML = 'speak'
    } else {
      cl.remove('speak-mode')
      cl.add('text-mode')
      modeInfo.innerHTML = 'text'
    }
    this.speakMode = value
  }
}
