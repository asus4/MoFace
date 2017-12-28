import Tone from 'tone'
import Stats from 'stats.js'
import dat from 'dat-gui'
import Vue from 'vue'

import {openPhotoLibrary} from './async'
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
    keyboard: new VirtualKeyboard(),
    detect: {
      scene: '',
      detector: null,
      result: null,
      file: null
    }
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
    watch: {
      pause(value) {
        console.log('pause changed', value)
        if (!value) {
          update()
        }
      }
    },
    //-------------------
    // Events
    //-------------------
    methods: {
      // Info
      infoShowClick(isShow) {
        this.showInfo = isShow
        this.pause = isShow
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
      },
      // Face detect
      makeFaceClick() {
        this.detect.scene = 'select'
        this.pause = true
      },
      startWebcamFaceDetect() {
        this.detect.file = null
        this.detect.result = null
        this.detect.detector = new AppFaceDetect(stats)
        this.detect.scene = 'capture'
        this.detect.detector.on('capture', (result) => {
          this.detect.result = result
          this.detect.scene = 'confirm'
          this.detect.detector.dispose()
          this.detect.detector = null
        })
      },
      startPhotoFaceDetect() {
        openPhotoLibrary().then((file) => {
          this.detect.file = file
          this.detect.result = null
          this.detect.detector = new AppFaceDetect(stats)
          this.detect.scene = 'capture'
          this.detect.detector.on('capture', (result) => {
            this.detect.result = result
            this.detect.scene = 'confirm'
            this.detect.detector.dispose()
            this.detect.detector = null
          })
        })
      },
      addNewFace() {
        this.morph.addFace(this.detect.result)
        this.detect.scene = ''
        this.detect.file = null
        this.detect.result = null
        if (this.detect.detector) {
          this.detect.detector.dispose()
          this.detect.detector = null
        }
        this.pause = false
      },
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
