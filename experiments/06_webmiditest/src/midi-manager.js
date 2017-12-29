import {EventEmitter} from 'events'

class MidiManager extends EventEmitter {
  constructor() {
    super()
  }

  start() {
    if (!navigator.requestMIDIAccess) {
      console.warn('No suppert Web-MIDI')
      return false
    }

    const onStateChange = (msg) => {
      console.log(msg)
    }
    const onSuccess = (midi) => {
      const inputs = midi.inputs.values()
      for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
        // console.log(input)
        input.value.onmidimessage = this.onMessage.bind(this)
        input.value.onstatechange = onStateChange
      }
    }
    const onFail = (err) => {
      console.log(err)
    }
    navigator.requestMIDIAccess().then(onSuccess, onFail)
  }

  onMessage(msg) {
    const data = msg.data
    switch (data[0]) {
      case 144:
        if (data[2] === 0) {
          this.emit('noteoff', data[1], data[2])
        } else {
          this.emit('noteon', data[1], data[2])
        }
        break
      case 128:
        this.emit('noteoff', data[1], data[2])
        break
      case 176:
        this.emit('cc', data[1], data[2])
        break
      default:
        console.log('other', data)
    }
  }
}

export default new MidiManager()
