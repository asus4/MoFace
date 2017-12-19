import dat from 'dat-gui'

import {loadBuffer} from './async'
import Mixer from './mixer'

function  setup(buffers) {
  console.log(buffers)

  // Init sound
  const mixer = new Mixer(buffers)

  // Make GUI
  const gui = new dat.GUI()
  gui.add(mixer, 'fade', 0.0, 1.0)
  gui.add(mixer, 'fadeEQ')
  gui.add(mixer, 'playbackRate', 0.1, 3.0)
  gui.add(mixer, 'grainSize', 0.1, 1.0)
  gui.add(mixer, 'detune', -1200, 1200)
}

// Load all images
Promise.all([
  loadBuffer('data/otabe.mp3'),
  loadBuffer('data/ryuuta.mp3'),
]).then((assets) => {
  setup(assets)
}).catch((err) => {
  console.error(err)
})


// Events
window.addEventListener('focus', () => {
  Mixer.mute = false
}, false)
window.addEventListener('blur', () => {
  Mixer.mute = true
}, false)
