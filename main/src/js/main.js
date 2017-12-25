import Tone from 'tone'
import Stats from 'stats.js'
import dat from 'dat-gui'

import AppMorph from './app-morph'
import AppFaceDetect from './app-face-detect'
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
  let faceDetect = false

  const app = new AppMorph(document.querySelector('#main canvas'))
  if (DEV) {
    app.stats = stats
    app.addGui(gui)
  }

  const update = () => {
    if (pause) {
      return
    }
    requestAnimationFrame(update)
    app.update()
  }

  // Events
  window.addEventListener('focus', () => {
    Tone.Master.mute = false
  }, false)
  window.addEventListener('blur', () => {
    Tone.Master.mute = true
  }, false)
  window.addEventListener('resize', () => {
    app.resize()
  }, false)
  pageManager.on('pause', (isPause) => {
    pause = isPause
    if (!pause) {
      if (faceDetect) {
        faceDetect.dispose()
        faceDetect = null
      }
      update()
    }
  })
  pageManager.on('face-detect', () => {
    console.log('face detect')
    faceDetect = new AppFaceDetect(document.getElementById('makeface-canvas'), stats)
  })

  // Start
  update()
}

