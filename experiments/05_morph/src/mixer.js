import Tone from 'tone'

function lerpVolume(start, end, value) {
  // Apply to EXPO easing function
  value = Math.pow( 2, 10 * (value - 1))
  return start * value + end * (1 - value)
}

export default class Mixer {

  constructor(buffers) {
    this.players = buffers.map((buf) => {
      return new Tone.Player(buf)
    })
    this.eqs = this.players.map((player) => {
      player.loop = true
      const eq = new Tone.EQ3({
        low: 0,
        mid: 0,
        high: 0
      })
      player.connect(eq)
      eq.toMaster()
      player.start()
      return eq
    })

    this._fade = 0.5
    this.fadeEQ = false
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
      this.players[0].volume.value = A
      this.players[1].volume.value = B
    }
  }

  static get mute() {
    return Tone.Master.mute
  }

  static set mute(value) {
    Tone.Master.mute = value
  }
}
