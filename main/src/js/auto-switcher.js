import shuffle from 'shuffle-array'
import {EventEmitter} from 'events'

export default class AutoSwitcher extends EventEmitter {
  constructor(channelLength) {
    super()

    this.channelLength = channelLength
    this.lastChannel = -1
    this.channels = this.makeChannels()
  }

  update(fade) {
    if (fade < 0.1 && this.lastChannel != 1) {
      this.emit('switch', 1, this.nextChannel())
      this.lastChannel = 1
    } else if (fade > 0.9 && this.lastChannel != 0) {
      this.emit('switch', 0, this.nextChannel())
      this.lastChannel = 0
    }
  }

  makeChannels() {
    const arr = []
    for (let i = 0; i < this.channelLength; ++i) {
      arr.push(i)
    }
    return shuffle(arr)
  }

  nextChannel() {
    if (this.channels.length == 0) {
      this.channels = this.makeChannels()
    }
    return this.channels.shift()
  }

}
