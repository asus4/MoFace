// Import into Global namespace since the error on compile time. It works dev build though....
// import clm from 'clmtrackr'

import {EventEmitter} from 'events'

import math from 'mathjs'

import config from './config'
import {loadImageAsync, loadFileAsync} from './async'
import headPoints from './head-points'

const STD_THRETHOLD = 0.2
// const STD_THRETHOLD = 0.02

/**
 * Draw image into canvas 
 * @param {HTMLVideoElement|HTMLImageElement} element
 * @param {HTMLCanvasElement} canvas
 * @param {Number} targetAspect
 */
function drawElement(element, canvas, targetAspect = 0) {
  const ctx = canvas.getContext('2d')

  // destination size
  const dw = canvas.width
  const dh = canvas.height
  // source size
  let sw, sh
  if (element instanceof HTMLImageElement) {
    sw = element.width
    sh = element.height
  } else if (element instanceof HTMLVideoElement) {
    sw = element.videoWidth
    sh = element.videoHeight
  }
  const sourceAspect = sw / sh // souce aspect
  if (targetAspect === 0) {
    targetAspect = dw / dh
  }

  if (sourceAspect > targetAspect) {
    const cropW = sh * targetAspect
    ctx.drawImage(element, (sw - cropW) / 2, 0, cropW, sh, 0, 0, dw, dh)
  } else {
    const cropH = sw / targetAspect
    ctx.drawImage(element, 0, (sh - cropH) / 2, sw, cropH, 0, 0, dw, dh)
  }
}

export default class AppFaceDetect extends EventEmitter {
  /**
   * Creates an instance of AppFaceDetect.
   * @param {Canvas} target 
   * @param {stats.js} stats 
   * @memberof AppFaceDetect
   */
  constructor(stats) {
    super()
    if (stats) {
      this.stats = stats
      document.removeEventListener('clmtrackrIteration', this.onTrackerInteration, false)
    }
    document.addEventListener('clmtrackrConverged', this.onTrackrConverged.bind(this), false)
    document.addEventListener('clmtrackrNotFound', this.onTrackerFailue.bind(this), false)
    document.addEventListener('clmtrackrLost', this.onTrackerFailue.bind(this), false)

    this.tracker = new clm.tracker({useWebGL: true})
    this.tracker.init()

    this.histories = []
    this.input = null
  }

  start(file, detectFaceCanvas, detecgtFaceOverlay) {
    this.canvas = detectFaceCanvas
    this.ctx = this.canvas.getContext('2d')
    this.overlay = detecgtFaceOverlay
    if (file) {
      this._startImage(file)
    } else {
      this._startCamera()
    }
  }

  /**
   * Start from web camera
   * 
   * @memberof AppFaceDetect
   */
  _startCamera() {
    this.useCamera = true
    const option = {
      audio: false,
      video: {
        facingMode: 'user', // use facing camera
        // width: { min: 480, ideal: 640, max: 1280 },
        // height: { min: 480, ideal: 640, max: 1280 }
      }
    }
    const onSuccess = (stream) => {
      this.input = document.createElement('video')
      this.input.srcObject = stream
      this.input.onloadedmetadata = this.input.onresize = this._start.bind(this)
      this.input.play()
    }
    const onError = (err) => {
      console.warn(err)
    }
    navigator.getUserMedia(option, onSuccess, onError)
  }

  /**
   * Start from Image file
   * 
   * @param {any} file 
   * @memberof AppFaceDetect
   */
  _startImage(file) {
    this.useCamera = false
    loadFileAsync(file).then((dataURL) => {
      return loadImageAsync(dataURL)
    }).then((img) => {
      this.input = img
      this._start()
    })
  }

  _start() {
    this.resizeFill(this.canvas.parentNode)
    this.canvas.width = this.overlay.width = 1920 / 4
    this.canvas.height = this.overlay.height = 1280 / 4

    drawElement(this.input, this.canvas)

    this.tracker.stop()
    this.tracker.reset()
    this.tracker.start(this.canvas)

    this.update()
  }

  /**
   * 
   * @param {Element} container
   * @memberof AppFaceDetect
   */
  resizeFill(container) {
    const fitWidth = container.clientWidth / container.clientHeight > config.aspect
    const children = [ ...container.children]
    children.forEach((element) => {
      if (fitWidth) {
        element.style.width = '100%'
        element.style.height = 'auto'
      } else {
        element.style.width = 'auto'
        element.style.height = '100%'
      }
    })

  }

  dispose() {
    console.log('dispose face detect')
    cancelAnimationFrame(this.requestID)

    document.removeEventListener('clmtrackrIteration', this.onTrackerInteration.bind(this), false)
    document.removeEventListener('clmtrackrConverged', this.onTrackrConverged.bind(this), false)
    document.removeEventListener('clmtrackrNotFound', this.onTrackerFailue.bind(this), false)
    document.removeEventListener('clmtrackrLost', this.onTrackerFailue.bind(this), false)

    if (this.input) {
      if (this.input instanceof HTMLVideoElement) {
        this.input.srcObject.getTracks().forEach((track) => {
          track.stop()
        })
        this.input.srcObject = null
      }
      this.input = null
    }

    if (this.tracker) {
      // this.tracker.reset()
      this.tracker.stop()
      this.tracker = null
    }

    this.canvas = null
  }

  update() {
    if (this.canvas == null || this.processing) {
      return
    }
    this.requestID = requestAnimationFrame(this.update.bind(this))

    //
    if (this.useCamera) {
      drawElement(this.input, this.canvas)
    }
    {
      this.overlay.getContext('2d').clearRect(0, 0, this.overlay.width, this.overlay.height)
    }

    //
    const positions = this.tracker.getCurrentPosition()
    if (positions) {
      this.tracker.draw(this.overlay)

      const noseX = positions[31][0]
      this.histories.push(noseX)

      if (this.histories.length > 60) {
        const std = math.std(this.histories)
        if (config.DEV) {
          console.log(std, noseX)
        }
        if (std < STD_THRETHOLD) {
          this.capture(positions)
        }
        this.histories.shift()
      }

    }
  }

  capture(points) {
    cancelAnimationFrame(this.requestID)
    this.processing = true

    // Generate extra head points
    const head = headPoints(points)
    points.push(...head)
    // Convert to relative scale
    const width = this.canvas.width
    const height = this.canvas.height
    const relativePoints = points.map((p) => {
      return [p[0] / width, p[1] / height]
    })
    // Add corner points
    relativePoints.push([0, 0], [1, 0], [1, 1], [0, 1])

    // Draw big image into 1024x1024 canvas
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1024
    drawElement(this.input, canvas, config.aspect)

    loadImageAsync(canvas.toDataURL()).then((img) => {
      this.emit('capture', img, relativePoints)
    })
  }

  onTrackerInteration() {
    this.stats.update()
  }

  onTrackerFailue() {
    console.log('onTrackerFailue')
    // this.tracker.stop()
  }

  onTrackrConverged() {
    console.log('onTrackrConverged')
    // this.tracker.stop()
  }

}
