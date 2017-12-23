const EventEmitter = require('events').EventEmitter
import createjs from 'preload-js'

/**
 * CreateJS.PreloaderJS wrapper with WebAudio decoding
 * 
 * @export
 * @class Preloader
 * @extends {EventEmitter}
 */
export default class Preloader extends EventEmitter {

  constructor(manifest) {
    super()
    // Set all progress to 0
    manifest.forEach((item) => {
      item.progress = 0.0
    })
    this.manifest = manifest

    // context
    const AudioContext = window.AudioContext || window.webkitAudioContext
    this.context = new AudioContext()

    this.queue = new createjs.LoadQueue()
    this.progress = 0
  }

  load() {
    this.queue.setMaxConnections(5)

    this.queue.on('fileprogress', this._onFileProgress.bind(this))
    this.queue.on('fileload', this._onFileLoad.bind(this))
    this.queue.on('complete', this._onComplete.bind(this))

    this.queue.loadManifest(this.manifest)
  }

  dispose() {
    this.context.close()
    this.context = null
  }

  get loaded() {
    return this.queue.loaded
  }

  get decoded() {
    return this.manifest.filter((item) => {
      return item.src.indexOf('.mp3') >= 0
    }).every((item) => item.buffer != null)
  }

  get completed() {
    return this.loaded && this.decoded
  }

  _onFileProgress(e) {
    e.item.progress = e.progress

    // Calucrate weighted progress
    let loaded = 0
    let total = 0
    for (const item of this.manifest) {
      loaded += item.progress * item.weight
      total += item.weight
    }
    this.progress = loaded / total
    this.emit('progress', this.progress)
  }

  _onFileLoad(e) {
    const item = e.item
    item.progress = 1

    // Decode sound file
    if (item.src.indexOf('.mp3') >= 0) {
      this._decode(e.result).then((buff) => {
        item.buffer = buff
        if (this.decoded && this.loaded) {
          this.emit('complete')
        }
      })
    }
  }

  _onComplete() {
    if (this.decoded && this.loaded) {
      this.emit('complete')
    }
  }

  _decode(arraybuffer) {
    return new Promise( (resolve, reject) => {
      this.context.decodeAudioData(arraybuffer, (buffer) => {
        if (buffer != null) {
          resolve(buffer)
        }
        else {
          reject('could not decode audio data')
        }}
      )
    })
  }
}
