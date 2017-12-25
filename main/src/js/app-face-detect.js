const EventEmitter = require('events').EventEmitter
import clm from 'clmtrackr'

export default class AppFaceDetect extends EventEmitter {
  /**
   * Creates an instance of AppFaceDetect.
   * @param {Canvas} target 
   * @param {stats.js} stats 
   * @memberof AppFaceDetect
   */
  constructor(target, stats) {
    super()

    this.canvas = target
    if (stats) {
      this.stats = stats
      document.addEventListener('clmtrackrIteration', this.onTrackerUpdate.bind(this), false)
    }

    const option = {
      audio: false,
      video: {
        facingMode: 'user' // use facing camera
      }
    }
    navigator.getUserMedia(option, this.setup.bind(this), (err) => {
      console.warn(err)
    })
  }

  /**
   * 
   * @param {MediaStream} stream 
   * @memberof AppFaceDetect
   */
  setup(stream) {
    this.ctx = this.canvas.getContext('2d')
    this.tracker = new clm.tracker({useWebGL: true})
    this.tracker.init()

    this.video = document.createElement('video')
    this.video.srcObject = stream
    this.video.onloadedmetadata = this.onVideoResize.bind(this)
    this.video.onresize = this.onVideoResize.bind(this)
    this.video.play()

    this.update()
  }

  dispose() {
    if (this.stats) {
      document.removeEventListener('clmtrackrIteration', this.onTrackerUpdate, false)
    }
    if (this.video) {
      this.video.srcObject.getTracks().forEach((track) => {
        track.stop()
      })
      this.video.srcObject = null
    }
    this.video = null
    this.ctx = null
    if (this.tracker) {
      this.tracker.stop()
    }
    this.tracker = null
    this.canvas = null
  }

  update() {
    if (!this.canvas) {
      return
    }
    requestAnimationFrame(this.update.bind(this))

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.drawImage(this.video, 0, 0)

    const positions = this.tracker.getCurrentPosition()
    if (positions) {
      this.tracker.draw(this.canvas)
    }
  }

  onTrackerUpdate() {
    this.stats.update()
  }


  onVideoResize() {
    this.video.width = this.video.videoWidth
    this.video.height = this.video.videoHeight
    this.canvas.width = this.video.videoWidth
    this.canvas.height = this.video.videoHeight

    this.tracker.stop()
    this.tracker.reset()
    this.tracker.start(this.video)
  // video.style.width = canvas.style.width = `${w}px`
  }

}
