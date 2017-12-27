const EventEmitter = require('events').EventEmitter
import clm from 'clmtrackr'
import math from 'mathjs'

import config from './config'
import {loadImageAsync, loadFileAsync} from './async'

const STD_THRETHOLD = 0.2
// const STD_THRETHOLD = 0.02

export default class AppFaceDetect extends EventEmitter {
  /**
   * Creates an instance of AppFaceDetect.
   * @param {Canvas} target 
   * @param {stats.js} stats 
   * @memberof AppFaceDetect
   */
  constructor(stats) {
    super()

    this.canvas = document.getElementById('makeface-canvas')
    this.overlay = document.getElementById('makeface-overlay')

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
  }

  startCamera() {
    this.useCamera = true
    const option = {
      audio: false,
      video: {
        facingMode: 'user', // use facing camera
        width: { min: 480, ideal: 640, max: 1280 },
        height: { min: 480, ideal: 640, max: 1280 }
      }
    }
    navigator.getUserMedia(option, this.setupCamera.bind(this), (err) => {
      console.warn(err)
    })
  }

  startImage(file) {
    this.useCamera = false

    loadFileAsync(file).then((dataURL) => {
      return loadImageAsync(dataURL)
    }).then((img) => {
      const w = img.width
      const h = img.height

      this.canvas.width = this.overlay.width = w
      this.canvas.height = this.overlay.height = h

      const ctx = this.canvas.getContext('2d')
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      ctx.drawImage(img, 0, 0)

      this.tracker.stop()
      this.tracker.reset()
      this.tracker.start(this.canvas)

      this.update()
    })
  }

  setupCamera(stream) {
    this.video = document.createElement('video')

    const onVideoResize = () => {
      const w = this.video.videoWidth
      const h = this.video.videoHeight

      this.video.width = this.canvas.width = this.overlay.width = w
      this.video.height = this.canvas.height = this.overlay.height = h

      this.tracker.stop()
      this.tracker.reset()
      this.tracker.start(this.video)

      this.update()
    }
    this.video.srcObject = stream
    this.video.onloadedmetadata = onVideoResize
    this.video.onresize = onVideoResize
    this.video.play()
  }

  dispose() {
    console.log('dispose face detect')
    cancelAnimationFrame(this.requestID)

    document.removeEventListener('clmtrackrIteration', this.onTrackerInteration.bind(this), false)
    document.removeEventListener('clmtrackrConverged', this.onTrackrConverged.bind(this), false)
    document.removeEventListener('clmtrackrNotFound', this.onTrackerFailue.bind(this), false)
    document.removeEventListener('clmtrackrLost', this.onTrackerFailue.bind(this), false)

    if (this.video) {
      this.video.srcObject.getTracks().forEach((track) => {
        track.stop()
      })
      this.video.srcObject = null
      this.video = null
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
      const ctx = this.canvas.getContext('2d')
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      ctx.drawImage(this.video, 0, 0)
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

      if (this.histories.length > 20) {
        const std = math.std(this.histories)
        if (config.DEV) {
          console.log(std, noseX)
        }
        if (std < STD_THRETHOLD) {
          this.capture()
        }
        this.histories.shift()
      }

    }
  }

  capture() {
    cancelAnimationFrame(this.requestID)
    this.processing = true
    loadImageAsync(this.canvas.toDataURL()).then((img) => {
      this.emit('capture', img)
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
