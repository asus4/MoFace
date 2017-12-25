import Tone from 'tone'

export default class VoiceMixer {
  constructor(buffers, infos) {
    this.crossFade = new Tone.CrossFade()
    this.players = buffers.map((buf) => {
      return new Tone.Player(buf)
    })
    this.players[0].connect(this.crossFade, 0, 0)
    this.players[1].connect(this.crossFade, 0, 1)
    this.infos = infos
    this.crossFade.toMaster()
  }

  play(key, mix) {
    if (!(key in this.infos[0])) {
      console.warn(`unkown 0 key${  key}`)
      return
    }
    if (!(key in this.infos[1])) {
      console.warn(`unkown 1 key${  key}`)
      return
    }
    const curr =  Tone.context.currentTime + 0.01
    this.infos[key]
    this.crossFade.fade.value = mix
    this.players.forEach((player, index) => {


      const info = this.infos[index][key]
      player.start(curr + 0, info.start, info.end - info.start)
    })
  }
}
