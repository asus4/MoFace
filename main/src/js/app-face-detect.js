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
function drawElement(element, canvas, overrideAspect = 0) {
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
  let targetAspect = dw / dh
  if (overrideAspect !== 0) {
    targetAspect = overrideAspect
  }

  // If sW > sH : Use aspect fill
  if (sw > sh) {
    if (sourceAspect > targetAspect) {
      const cropW = sh * targetAspect
      ctx.drawImage(element, (sw - cropW) / 2, 0, cropW, sh, 0, 0, dw, dh)
    } else {
      const cropH = sw / targetAspect
      ctx.drawImage(element, 0, (sh - cropH) / 2, sw, cropH, 0, 0, dw, dh)
    }
  } else {
    // If sW < sH : Use aspect fit
    if (sourceAspect > targetAspect) {
      // Considering in case of override target aspect retio
      // const fitH = dw / sw * sh
      const fitH = targetAspect / sourceAspect * dh
      ctx.drawImage(element, 0, 0, sw, sh, 0, (dh - fitH) / 2, dw, fitH)
    } else {
      // const fitW = dh / sh * sw
      const fitW = sourceAspect / targetAspect * dw
      ctx.drawImage(element, 0, 0, sw, sh, (dw - fitW) / 2, 0, fitW, dh)
    }
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
    this.useCamera = false
  }

  /**  Start from web camera
   * @param {HTMLVideoElement} video
   * @memberof AppFaceDetect
   */
  startCamera(video) {
    this.useCamera = true
    const option = {
      audio: true,
      video: {
        facingMode: 'user', // use facing camera
        // width: { min: 480, ideal: 640, max: 1280 },
        // height: { min: 480, ideal: 640, max: 1280 }
      }
    }
    const onSuccess = (stream) => {
      this.input = video
      video.muted = true
      video.srcObject = stream
      video.onloadedmetadata = video.onresize = this._start.bind(this)
    }
    const onError = (err) => {
      console.error(err)
    }
    navigator.getUserMedia(option, onSuccess, onError)
  }

  /**
   * Start from Image file
   * @param {any} file
   * @memberof AppFaceDetect
   */
  startImage(file) {
    this.useCamera = false
    loadFileAsync(file).then((dataURL) => {
      return loadImageAsync(dataURL)
    }).then((img) => {
      this.input = img
      this._start()
    })
  }

  _start() {

    this.canvas.width = this.overlay.width = 1920 / 4
    this.canvas.height = this.overlay.height = 1280 / 4
    drawElement(this.input, this.canvas)
    if (this.useCamera) {
      this.input.play()
    }

    this.tracker.stop()
    this.tracker.reset()

    this.tracker.start(this.canvas)
    this.update()
  }

  dispose() {
    console.log('dispose face detect')
    cancelAnimationFrame(this.requestID)

    document.removeEventListener('clmtrackrIteration', this.onTrackerInteration.bind(this), false)
    document.removeEventListener('clmtrackrConverged', this.onTrackrConverged.bind(this), false)
    document.removeEventListener('clmtrackrNotFound', this.onTrackerFailue.bind(this), false)
    document.removeEventListener('clmtrackrLost', this.onTrackerFailue.bind(this), false)

    if (this.input) {
      if (this.inputIsVideo) {
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

    if (this.useCamera) {
      drawElement(this.input, this.canvas)
    }
    this.overlay.getContext('2d').clearRect(0, 0, this.overlay.width, this.overlay.height)

    // Tracker
    const positions = this.tracker.getCurrentPosition()
    if (positions) {
      this.tracker.draw(this.overlay)

      const noseX = positions[31][0]
      this.histories.push(noseX)

      if (this.histories.length > 60) {
        const std = math.std(this.histories)
        // if (config.DEV) {
        //   console.log(std, noseX)
        // }
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
    // drawElement(this.input, canvas, config.aspect)
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

  get inputIsVideo() {
    return (this.input instanceof HTMLVideoElement)
  }

}
