import 'three'
// import THREE extra modules
// DO NOT use yarn instead of npm, since it removes example folder
import 'three/examples/js/shaders/CopyShader'
import 'three/examples/js/shaders/SepiaShader'

import 'three/examples/js/postprocessing/EffectComposer'
import 'three/examples/js/postprocessing/ShaderPass'
import 'three/examples/js/postprocessing/RenderPass'

import SimplexNoise from 'simplex-noise'

import assets from './assets'
import {setTimeoutAsync} from './async'
import CompositePass from './composite-pass'
import Morpher from './morpher'
import VoiceMixer from './voice-mixer'
import config from './config'
import {remap} from './math'
import AutoSwicher from './auto-switcher'
import DisplacementTexture from './displacement-texture'

const simplex = new SimplexNoise()

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

    this.displacementTex = new DisplacementTexture(this.renderer)
    if (config.DEV) {
      this.scene.add(this.displacementTex.createDebugMesh())
    }

    this.morpher = new Morpher(this.displacementTex)
    this.scene.add(this.morpher)


    this.resize()


    this.position = new THREE.Vector2(0.5, 0.5)
    this.smoothPosition = new THREE.Vector2(0.5, 0.5)

    this.autoSwicher = new AutoSwicher(assets.voices.length)
    this.autoSwicher.on('switch', (channel, index) => {
      if (channel === 0) {
        this.channelA = index
      } else {
        this.channelB = index
      }
    })

    this.channelA = this.autoSwicher.nextChannel()
    this.channelB = this.autoSwicher.nextChannel()

    this.autoPan = false
  }

  initScene() {
    // Scene
    const width = window.innerWidth
    const height = window.innerHeight
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      preserveDrawingBuffer: true,
    })
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

  addFace(img, points) {
    this.morpher.addFace(img, points)
    this.autoSwicher.channelLength = this.morpher.channels.length
  }

  /**
   * @param {String} character 
   * @param {Number} pan 
   * @memberof AppMorph
   */
  say(character, pan) {
    this.mixer.play(character, pan)
  }

  /**
   * @param {[String]} words 
   * @memberof AppMorph
   */
  async conversation(words, delay = 0) {
    await setTimeoutAsync(delay)
    this.autoPan = true
    let count = Math.round(Math.random())
    for (const word of words) {
      for (const character of word) {
        await setTimeoutAsync(200)
        this.setPosition(count % 2, Math.random())
        this.say(character, count % 2)
        count++
      }
      await setTimeoutAsync(500)
    }
    this.autoPan = false
  }

  /**
   * @param {Number} x 
   * @param {Number} y 
   * @memberof AppMorph
   */
  setPosition(x, y) {
    // console.log(x, y)
    this.position.x = x
    this.position.y = y
    this.autoSwicher.update(x)
    this.displacementTex.setPosition(x, y)
  }

  update(now) {
    if (this.autoPan) {
      this.position.x = simplex.noise2D(now * 0.0014, 0.15) + 0.5
      this.position.y = simplex.noise2D(now * 0.001, 0.7) + 0.5
    }
    // position update
    this.smoothPosition.lerp(this.position, 0.3)
    this.mixer.fade = this.morpher.fade = this.smoothPosition.x
    const direction = config.mobile ? -1 : 1 // invert look angle on mobile
    this.morpher.lookX = remap(this.smoothPosition.x, 0, 1, -1, 1) * direction
    this.morpher.lookY = remap(this.smoothPosition.y, 0, 1, -1, 1) * direction


    this.displacementTex.render()

    this.composer.render()
    if (this.stats) {
      this.stats.update()
    }
  }

  resize() {
    const main = document.getElementById('main')
    const width = main.clientWidth
    const height = main.clientHeight

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
    morphs.add(this.morpher, 'wireframe')
    morphs.add(this.displacementTex, 'fadeMap', { TypeA: 0, TypeB: 1, TypeC: 2 } )
    morphs.add(this.morpher, 'parallax', 0.0, 0.1)

    const members = {}
    const names = ['iwata', 'kikuchi', 'kiyokawa', 'kogawa', 'matsuo', 'nakamura', 'noda', 'onodera', 'otabe', 'takaki', 'user']
    names.forEach((member, index) => {
      members[member] = index
    })

    morphs.add(this, 'channelA', members)
    morphs.add(this, 'channelB', members)

    const effects = gui.addFolder('post effects')
    effects.add(this.composite, 'blend', 0, 1)
  }

  get channelA() {return this._channelA}
  set channelA(value) {
    this.morpher.channelA = this.mixer.channelA = value
    this._channelA = value
  }
  get channelB() {return this._channelB}
  set channelB(value) {
    this.morpher.channelB = this.mixer.channelB = value
    this._channelB = value
  }

}

