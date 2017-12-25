import Tone from 'tone'
import Stats from 'stats.js'
import dat from 'dat-gui'

import assets from './assets'
import Voicer from './voicer'
import View from './view'
import VirtualKeyboard from './virtual-keyboard'
import pageManager from './page-manager'

const DEV = process.env.NODE_ENV === 'development'

// Stats
const stats = DEV ? new Stats() : null
if (stats) {
  stats.domElement.style.position = 'absolute'
  stats.domElement.style.top = '0px'
  document.body.appendChild(stats.domElement)
}
// Dat GUI
const gui = DEV ? new dat.GUI() : null

// Main
export default function() {
  let pause = false
  // Morphing parameters
  const morphs = assets.buffers.map(() => {return 1})
  morphs.push(1) // user channel

  const voicer = new Voicer(assets.buffers, assets.spritemaps)
  const view = new View(document.querySelector('#main canvas'))
  for (const img of assets.images) {
    view.addFace(img, null)
  }

  const keyboard = new VirtualKeyboard(window)
  keyboard.on('key', (input, pan) => {
    console.log('on key:', input, pan)
    voicer.play(input, pan)
  })

  const update = () => {
    if (pause) {
      return
    }
    requestAnimationFrame(update)
    view.update()
    if (DEV) {
      stats.update()
    }
  }

  // Events
  window.addEventListener('focus', () => {
    Tone.Master.mute = false
  }, false)
  window.addEventListener('blur', () => {
    Tone.Master.mute = true
  }, false)
  window.addEventListener('resize', () => {
    view.resize()
  }, false)
  pageManager.on('pause', (isPause) => {
    pause = isPause
    if (!pause) {
      update()
    }
  })

  // GUI
  if (gui) {
    const f = gui.addFolder('morphs')
    for (let i = 0; i < morphs.length; ++i) {
      f.add(morphs, i, 0.0, 1.0).name(`morph ${i}`).onChange(() => {
        view.updateMorph(morphs)
      })
    }
    view.addGui(gui)
  }

  update()
}

