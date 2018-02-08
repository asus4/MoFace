import 'three'
// import THREE extra modules
// DO NOT use yarn instead of npm, since it removes example folder
import 'three/examples/js/shaders/CopyShader'
import 'three/examples/js/shaders/SepiaShader'

import 'three/examples/js/postprocessing/EffectComposer'
import 'three/examples/js/postprocessing/ShaderPass'
import 'three/examples/js/postprocessing/RenderPass'

import easeQuadOut from 'eases/quad-out'
import SimplexNoise from 'simplex-noise'
import BezierEasing from 'bezier-easing'

import assets from './assets'
import {setTimeoutAsync} from './async'
import CompositePass from './composite-pass'
import Morpher from './morpher'
import VoiceMixer from './voice-mixer'
import config from './config'
import {remap, lerp} from './math'
import AutoSwicher from './auto-switcher'
import DisplacementTexture from './displacement-texture'
import RomaJi from './roma-ji'

const simplex = new SimplexNoise()
// const fadeEase = BezierEasing(0.1, 0.5, 0.9, 0.5)
const fadeEase = BezierEasing(0.2, 0.7, 0.8, 0.3)

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

    this._effectAmount = 1
    this._effectDecay = 1.5
  }

  initScene() {
    // Scene
    const width = window.innerWidth
    const height = window.innerHeight
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
    })
    this.renderer.setSize(width, height)
    this.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -10, 10)
    this.scene = new THREE.Scene()

    // Displacement texture
    this.displacementTex = new DisplacementTexture(this.renderer)
    if (config.DEV && false) {
      const devMesh = this.displacementTex.createDebugMesh()
      devMesh.scale.set(256, 128, 1)
      devMesh.position.set(0, 0, 10)
      this.scene.add(devMesh)
    }

    // Post effects
    this.composer = new THREE.EffectComposer(this.renderer)
    this.composer.addPass(new THREE.RenderPass(this.scene, this.camera))
    this.composite = new CompositePass(this.displacementTex)
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
    this.effectAmount = 1
    this.mixer.play(character, pan)
  }

  /** Speak words
   * @param {[String]} words 
   * @memberof AppMorph
   */
  async conversation(words, delay = 0) {
    await setTimeoutAsync(delay)
    this.autoPan = true

    let count = Math.round(Math.random())
    for (const word of words) {
      let c = ''
      for (const character of word) {
        if (c.length === 0) {
          c = character
          continue
        }
        if (RomaJi.isYoon(character)) {
          this.say(c + character, count % 2)
          c = ''
        } else {
          this.say(c, count % 2)
          c = character
        }
        this.setPosition(count % 2, Math.random())
        count++
        await setTimeoutAsync(200)
      }
      // Say the final character
      if (c.length > 0) {
        this.setPosition(count % 2, Math.random())
        this.say(c, count % 2)
      }
      // Wait a little in word
      await setTimeoutAsync(300)
    }
    this.autoPan = false
  }

  /**
   * @param {Number} x 
   * @param {Number} y 
   * @memberof AppMorph
   */
  setPosition(x, y, needTextureUpdate) {
    // console.log(x, y)
    this.position.x = x
    this.position.y = y
    this.autoSwicher.update(x)
    if (needTextureUpdate) {
      this.displacementTex.updatePosition(x, y)
    }
  }

  /** Update every frame
   * @param {number} time from start in seconds
   * @param {number} frame delta time in seconds
   * @memberof AppMorph
   */
  update(time, deltaTime) {
    if (this.autoPan) {
      this.position.x = simplex.noise2D(time * 1.4, 0.15) + 0.5
      this.position.y = simplex.noise2D(time * 1, 0.7) + 0.5
    }

    // Update position
    this.smoothPosition.lerp(this.position, 0.3)
    this.mixer.fade = this.morpher.fade = fadeEase(this.smoothPosition.x)
    const direction = config.mobile ? -1 : 1 // invert look angle on mobile
    this.morpher.lookX = remap(this.smoothPosition.x, 0, 1, -1, 1) * direction
    this.morpher.lookY = remap(this.smoothPosition.y, 0, 1, -1, 1) * direction

    // Update effect amount
    if (this.effectAmount > 0.05) {
      this.effectAmount = lerp(this.effectAmount, 0,  deltaTime / this._effectDecay)
    }

    // Render displacement texture
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

    this.composite.resolution = new THREE.Vector2(width, height)
  }

  /** Add GUI
   * @param {dat.GUI} gui 
   * @memberof View
   */
  addGui(gui) {
    // Folder Morphs
    {
      const folder = gui.addFolder('Morphs')
      folder.add(this.morpher, 'wireframe')
      folder.add(this.morpher, 'parallax', 0.0, 0.1)

      const members = {}
      const names = ['iwata', 'kikuchi', 'kiyokawa', 'kogawa', 'matsuo', 'nakamura', 'noda', 'onodera', 'otabe', 'takaki', 'user']
      names.forEach((member, index) => {
        members[member] = index
      })

      folder.add(this, 'channelA', members)
      folder.add(this, 'channelB', members)
    }

    gui.add(this, '_effectDecay', 0, 4).name('effect decay time')

    // Folder Post Effect
    {
      const folder = gui.addFolder('Visual Effects')
      folder.add(this.composite, 'blend', 0, 1)
      folder.add(this.displacementTex, 'learningRate', 0, 1)
      folder.add(this.displacementTex, 'maskSize', 0, 1)
      folder.add(this.displacementTex, 'fillRate', 0, 1)
    }

    this.mixer.addGui(gui.addFolder('Sound Effects'))
  }

  get channelA() {return this.mixer.channelA}
  set channelA(value) {
    this.morpher.channelA = this.mixer.channelA = value
  }
  get channelB() {return this.mixer.channelB}
  set channelB(value) {
    this.morpher.channelB = this.mixer.channelB = value
  }
  get effectAmount() {return this._effectAmount}
  set effectAmount(value) {
    this._effectAmount = value
    const value2 = easeQuadOut(value) // get eased value
    this.mixer.effectAmount = lerp(0, 1, value)
    this.displacementTex.learningRate = lerp(0, 0.04, value2)
    this.displacementTex.fillRate = lerp(0.5, 0.085, value2)
  }

}

