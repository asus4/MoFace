import Tone from 'tone'

function lerpVolume(start, end, value) {
  // Apply to EXPO easing function
  value = Math.pow(2, 10 * (value - 1))
  return start * value + end * (1 - value)
}

export default class Mixer {

  constructor(buffers) {
    this.crossFade = new Tone.CrossFade()

    this.players = buffers.map((buf) => {
      return new Tone.GrainPlayer(buf)
    })
    this.eqs = this.players.map((player) => {
      player.loop = true
      const eq = new Tone.EQ3({
        low: 0,
        mid: 0,
        high: 0
      })
      player.connect(eq)
      player.start()
      return eq
    })
    this.eqs[0].connect(this.crossFade, 0, 0)
    this.eqs[1].connect(this.crossFade, 0, 1)
    this.crossFade.toMaster()

    this._fade = 0.5
    this.fadeEQ = false
    this._playbackRate = 1.0
    this._grainSize = 0.2
    this._detune = 0
  }

  get fade() {
    return this._fade
  }

  set fade(value) {
    this._fade = value
    const A = lerpVolume(-100, 0, value)
    const B = lerpVolume(-100, 0, 1 - value)

    if (this.fadeEQ) {
      this.eqs[0].high.value = A
      this.eqs[1].high.value = B
      this.eqs[0].mid.value = B
      this.eqs[1].mid.value = A
      this.eqs[0].low.value = A
      this.eqs[1].low.value = B
    } else {
      this.crossFade.fade.value = value
    }
  }

  get playbackRate() {
    return this._playbackRate
  }

  set playbackRate(value) {
    this._playbackRate = value
    for (const player of this.players) {
      player.playbackRate = value
    }
  }

  get grainSize() {
    return this._grainSize
  }

  set grainSize(value) {
    this._grainSize = value
    for (const player of this.players) {
      player.grainSize = value
    }
  }

  get detune() {
    return this._detune
  }

  set detune(value) {
    this._detune = value
    for (const player of this.players) {
      player.detune = value
    }
  }



  static get mute() {
    return Tone.Master.mute
  }

  static set mute(value) {
    Tone.Master.mute = value
  }
}
