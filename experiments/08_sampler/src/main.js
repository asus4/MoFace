import Tone from 'tone'

import {loadBuffer} from './async'
import Voicer from './voicer'
import VirtualKeyboard from './virtual-keyboard'


function  setup(buffers) {
  const voicer = new Voicer(buffers, [
    require('./data/otabe.json').spritemap,
    require('./data/ryuuta.json').spritemap
  ])

  console.log('start vkeybor')

  const keyboard = new VirtualKeyboard(window)
  keyboard.on('key', (input, pan) => {
    console.log('on key:', input, pan)
    voicer.play(input, pan)
  })
}

// Load all images
Promise.all([
  loadBuffer('./data/otabe.mp3'),
  loadBuffer('./data/ryuuta.mp3'),
]).then((assets) => {
  setup(assets)
}).catch((err) => {
  console.error(err)
})

// Events
window.addEventListener('focus', () => {
  Tone.Master.mute = false
}, false)
window.addEventListener('blur', () => {
  Tone.Master.mute = true
}, false)
