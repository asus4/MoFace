
import Tone from 'tone'

import {loadBuffer} from './js/async'
import Voicer from './js/voicer'
import VirtualKeyboard from './js/virtual-keyboard'

function setup(buffers) {
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

export default function(manifest) {
  console.log(manifest)
  // console.log(manifest.getResult('./data/otabe.mp3'))
  // console.log(manifest.getResult('./data/ryuuta.mp3'))
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


