import shuffle from 'shuffle-array'
import {EventEmitter} from 'events'

export default class AutoSwitcher extends EventEmitter {
  constructor(channelLength) {
    super()

    this._channelLength = channelLength
    this._lastChannel = -1
    this.hasPriorityChannel = false
    this.resetChannels()
  }

  update(fade) {
    if (fade < 0.1 && this._lastChannel != 1) {
      this.emit('switch', 1, this.nextChannel())
      this._lastChannel = 1
    } else if (fade > 0.9 && this._lastChannel != 0) {
      this.emit('switch', 0, this.nextChannel())
      this._lastChannel = 0
    }
  }

  resetChannels() {
    let arr = []
    for (let i = 0; i < this._channelLength; ++i) {
      arr.push(i)
    }
    arr = shuffle(arr)

    if (this.hasPriorityChannel) {
      const priorityChannel = this._channelLength
      const tmp = []
      arr.forEach((n, i) => {
        if (i % 2 == 0) {
          tmp.push(n, priorityChannel)
        } else {
          tmp.push(n)
        }
      })
      arr = tmp
    }
    // if (this.hasPriorityChannel) {
    //   const priorityChannel = this._channelLength
    //   arr.unshift(priorityChannel)
    // }
    this.channels = arr
  }

  nextChannel() {
    if (this.channels.length == 0) {
      this.resetChannels()
    }
    return this.channels.shift()
  }
}
