
import Tone from 'tone'

import Voicer from './js/voicer'
import VirtualKeyboard from './js/virtual-keyboard'

function setup(buffers) {
  const voicer = new Voicer(buffers, [
    require('./data/kogawa.json').spritemap,
    require('./data/ryuuta.json').spritemap
  ])

  const keyboard = new VirtualKeyboard(window)
  keyboard.on('key', (input, pan) => {
    console.log('on key:', input, pan)
    voicer.play(input, pan)
  })
}

export default function(manifest) {
  setup([
    manifest[0].buffer,
    manifest[1].buffer,
  ])

  // Events
  window.addEventListener('focus', () => {
    Tone.Master.mute = false
  }, false)
  window.addEventListener('blur', () => {
    Tone.Master.mute = true
  }, false)

}
