import Modernizr from 'exports-loader?Modernizr!../web_modules/modernizr-custom'
import Tone from 'tone'

import {loadBuffer} from './js/async'
import Voicer from './js/voicer'
import VirtualKeyboard from './js/virtual-keyboard'

console.log(Modernizr)


function  setup(buffers) {
  const voicer = new Voicer(buffers, [
    require('./data/otabe.json').spritemap,
    require('./data/ryuuta.json').spritemap
  ])

  const keyboard = new VirtualKeyboard(window)
  keyboard.on('key', (input, pan) => {
    console.log('on key:', input, pan)
    voicer.play(input, pan)
  })
}

export default function() {
  // Load all images
  console.time('buffer load')
  Promise.all([
    loadBuffer('./data/otabe.mp3'),
    loadBuffer('./data/ryuuta.mp3'),
  ]).then((assets) => {
    setup(assets)
    console.timeEnd('buffer load')
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

}
