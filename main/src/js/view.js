import 'three'
// import THREE extra modules
// DO NOT use yarn instead of npm, since it removes example folder
import 'three/examples/js/shaders/CopyShader'
import 'three/examples/js/shaders/SepiaShader'

import 'three/examples/js/postprocessing/EffectComposer'
import 'three/examples/js/postprocessing/ShaderPass'
import 'three/examples/js/postprocessing/RenderPass'

import Morpher from './morpher'
import CompositePass from './composite-pass'

export default class View {
  constructor(canvas) {
    // Scene
    const width = window.innerWidth
    const height = window.innerHeight
    this.canvas = canvas
    this.renderer = new THREE.WebGLRenderer({canvas})
    this.renderer.setSize(width, height)
    this.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -10, 10)
    this.scene = new THREE.Scene()

    // Post effects
    this.composer = new THREE.EffectComposer(this.renderer)
    this.composer.addPass(new THREE.RenderPass(this.scene, this.camera))
    this.composite = new CompositePass()
    this.composer.addPass(this.composite)
    this.composer.passes[this.composer.passes.length - 1].renderToScreen = true

    this.morphers = []

    this.resize()
  }

  addFace(img, data) {
    const morpher = new Morpher(img, data)
    this.scene.add(morpher)
    this.morphers.push(morpher)
  }

  update() {
    this.composer.render()
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
    const f = gui.addFolder('view')
    f.add(this.composite, 'blend', 0, 1)
  }
}
