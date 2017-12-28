import Tone from 'tone'
import Stats from 'stats.js'
import dat from 'dat-gui'
import Vue from 'vue'


import AppMorph from './app-morph'
import AppFaceDetect from './app-face-detect'
import config from './config'
import VirtualKeyboard from './virtual-keyboard'
import KanaIME from './kana-ime'
import ShareUtil from './share-util'


// Stats
const stats = config.DEV ? new Stats() : null
if (stats) {
  const style = stats.domElement.style
  style.top = '20%'
  document.body.appendChild(stats.domElement)
}
// Dat GUI
const gui = config.DEV ? new dat.GUI() : null


export default function() {
  // Make Vue App
  const store = {
    speakMode: true,
    isMobile: document.documentElement.classList.contains('mobile'),
    pause: false,
    showInfo: false,
    morph: null,
    ime: new KanaIME(),
    keyboard: new VirtualKeyboard()
  }

  const update = () => {
    if (store.pause) {
      return
    }
    requestAnimationFrame(update)
    store.morph.update()
  }

  new Vue({
    el: '#app-morph',
    data: store,
    //-------------------
    // Life cycle
    //-------------------
    mounted: () => {
      // App
      store.morph = new AppMorph()
      if (config.DEV) {
        store.morph.stats = stats
        store.morph.addGui(gui)
      }

      // Events
      store.keyboard.on('key', (input, pan) => {
        if (store.speakMode) {
          // console.log('on key:', input, pan)
          store.morph.mixer.play(input, pan)
        } else {
          // todo
        }
      })
      update()
    },
    //-------------------
    // Events
    //-------------------
    methods: {
      // Info
      infoShowClick() {
        this.showInfo = true
        this.pause = true
      },
      infoCloseClick() {
        this.showInfo = false
        this.pause = false
        update()
      },
      makeFaceClick() {
        console.log('make new face')
      },
      // SNS
      shareFacebookClick() {
        ShareUtil.facebook({
          app_id: '12345678',
          href: 'https://invisi.jp/'
        })
      },
      shareTwitterClick() {
        ShareUtil.twitter({
          text: '新年のあいさつ',
          url: 'https://invisi.jp/',
          hashtags: 'moface'
        })
      },
      //
      onKeyboardTouch(event) {
        this.keyboard.onTouch(event)
      }
    }
  })

  // Global Events
  window.addEventListener('focus', () => {
    Tone.Master.mute = false
  }, false)
  window.addEventListener('blur', () => {
    Tone.Master.mute = true
  }, false)
  window.addEventListener('resize', () => {
    store.morph.resize()
  }, false)

}

// Main
// export default function() {
function a() {

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

}

