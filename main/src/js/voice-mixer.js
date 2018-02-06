import Tone from 'tone'
import {lerp} from './math'

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

    this.crossFade = new Tone.CrossFade()
    this.crossFade.toMaster()

    this._channelA = 0
    this._channelB = 0
  }

  play(key, mix) {
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

}
