import Tone from 'tone'
import {lerp} from './math'
import easeExpoIn from 'eases/expo-in'

export default class VoiceMixer {
  constructor(buffers, infos) {
    // create duration
    for (const info of infos) {
      for (const key in info) {
        const o = info[key]
        o.duration = o.end - o.start
      }
    }
    this.infos = infos
    this.buffers = buffers

    // Effect chain
    this.delay = new Tone.FeedbackDelay('8n', 0.7)
    // this.reverb = new Tone.Freeverb(0.9, 4000)
    this.reverb = new Tone.JCReverb(0.97)
    // A-B track
    this.crossFade = new Tone.CrossFade()

    // Connect
    this.crossFade.connect(this.delay)
    this.delay.connect(this.reverb)
    this.reverb.toMaster()


    this._channelA = 0
    this._channelB = 0
    this._effectAmount = 1.0
  }

  play(key, mix) {
    this.reverbWet = easeExpoIn(1 - mix)
    this.delayWet = easeExpoIn(mix)
    console.log('play:', this.reverbWet, this.delayWet)

    // error check
    const playDatas = [
      this.getPlayData(this.channelA, key),
      this.getPlayData(this.channelB, key)
    ]
    if (playDatas.some((i) => {return i === null})) {
      return
    }
    const targetDuration = lerp(playDatas[0].info.duration, playDatas[1].info.duration, mix)
    this.crossFade.fade.value = mix
    playDatas.forEach((data, index) => {
      const playbackRate = data.info.duration / targetDuration
      let source = new Tone.BufferSource({
        buffer: data.buffer,
        playbackRate,
        onended: () => {
          source.dispose()
          source = null
        }
      })
      source.connect(this.crossFade, 0, index)
      source.start(Tone.context.currentTime + 0.01, data.info.start, data.info.duration / playbackRate)
    })

  }

  getPlayData(index, key) {
    // error check
    if (!(key in this.infos[index])) {
      console.error(`unkown ${index} key${key}`)
      return null
    }
    return {
      info: this.infos[index][key],
      buffer: this.buffers[index]
    }
  }

  get channelA() {return this._channelA}
  set channelA(value) {
    if (value < this.infos.length) {
      this._channelA = value
    } else {
      // console.warn(`channelA: ${value} is out of range`)
    }
  }
  get channelB() {return this._channelB}
  set channelB(value) {
    if (value < this.infos.length) {
      this._channelB = value
    } else {
      // console.warn(`channelB: ${value} is out of range`)
    }
  }

  // Effects
  get effectAmount() {return this._effectAmount}
  set effectAmount(value) {
    this._effectAmount = value
    // Update related
    this.reverbWet = this.reverbWet
    this.delayWet = this.delayWet
  }

  get reverbWet () {return this.reverb.wet.value}
  set reverbWet(value) {
    this.reverb.wet.value = value * this._effectAmount
  }

  get delayWet () {return this.delay.wet.value}
  set delayWet(value) {
    this.delay.wet.value = value * this._effectAmount
  }


  // Effects
  addGui(gui) {
    gui.add(this, 'effectAmount', 0, 1).name('effect amount')

    gui.add(this, 'reverbWet', 0, 1).name('reverb wet')
    gui.add(this.reverb.roomSize, 'value', 0, 1).name('reverb room-size')

    gui.add(this, 'delayWet', 0, 1).name('delay wet')
    gui.add(this.delay.feedback, 'value', 0, 1).name('delay feedback')
  }


}
