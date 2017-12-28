import Tone from 'tone'
import Stats from 'stats.js'
import dat from 'dat-gui'

import AppMorph from './app-morph'
import AppFaceDetect from './app-face-detect'
import pageManager from './page-manager'
import config from './config'


// Stats
const stats = config.DEV ? new Stats() : null
if (stats) {
  const style = stats.domElement.style
  // Place bottom / right
  style.position = 'absolute'
  style.bottom = style.right = '0px'
  style.top = style.left = null
  document.body.appendChild(stats.domElement)
}
// Dat GUI
const gui = config.DEV ? new dat.GUI() : null

// Main
export default function() {
  let pause = false
  let faceDetect = false
  let requestID = -1

  const app = new AppMorph()
  if (config.DEV) {
    app.stats = stats
    app.addGui(gui)
  }

  const update = () => {
    if (pause) {
      return
    }
    requestID = requestAnimationFrame(update)
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
    if (pause) {
      cancelAnimationFrame(requestID)
    } else {
      if (faceDetect) {
        faceDetect.dispose()
        faceDetect = null
      }
      update()
    }
  })

  pageManager.on('face-detect', (file) => {
    faceDetect = new AppFaceDetect(stats)
    if (file) {
      faceDetect.startImage(file)
    } else {
      faceDetect.startCamera()
    }
    faceDetect.on('capture', (image) => {
      faceDetect.dispose()
      faceDetect = null
      const modal = pageManager.showModal('makeface-confirm')
      const preview = modal.querySelector('.preview')
      preview.innerHTML = '' // reset
      preview.appendChild(image)
    })
  })

  pageManager.on('new-face', (img) => {
    app.addFace(img)
  })

  pageManager.on('mode-toggle', () => {
    app.isSpeakMode = !app.isSpeakMode
    console.log(`Toggle speakmode: ${app.isSpeakMode}`)
  })

  // Start
  update()
}

