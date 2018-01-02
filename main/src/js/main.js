import Tone from 'tone'
import Stats from 'stats.js'
import dat from 'dat-gui'
import Vue from 'vue'

import AppMorph from './app-morph'
import config from './config'
import VirtualKeyboard from './virtual-keyboard'
import KanaIME from './kana-ime'
import ShareUtil from './share-util'

import MixInFaceDetect from './main-face-detect'

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
    stats,
  }

  const update = (now) => {
    if (store.pause) {
      return
    }
    requestAnimationFrame(update)
    store.morph.update(now)
  }

  new Vue({
    el: '#app-morph',
    data: store,
    mixins: [MixInFaceDetect],
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
          store.morph.say(input, pan)
        } else {
          // todo
          console.warn('todo text mode implemnt')
        }
      })
      store.keyboard.on('fade', (x, y) => {
        store.morph.setPosition(x, y)
      })
      requestAnimationFrame(update)
    },
    watch: {
      pause(value) {
        console.log('pause changed', value)
        if (!value) {
          requestAnimationFrame(update)
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
          hashtags: 'MoFace'
        })
      },
      //
      onKeyboardTouch(event) {
        this.keyboard.onTouch(event)
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
