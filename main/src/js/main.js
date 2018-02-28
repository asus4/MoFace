import 'babel-polyfill'

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
    isMobile: document.documentElement.classList.contains('mobile'),
    pause: false,
    showInfo: false,
    morph: null,
    ime: new KanaIME(),
    keyboard: new VirtualKeyboard(),
    stats,
    // TODO: load from url encoding
    inputLogs: ['われわれは', 'どこからきて', 'どこへむかうのか'],
  }

  // update
  let lastTime = 0
  const update = (now) => {
    if (store.pause) {
      lastTime = now
      return
    }
    requestAnimationFrame(update)
    store.morph.update(now / 1000, (now - lastTime) / 1000)
    lastTime = now
  }

  const app = new Vue({
    el: '#app-morph',
    data: store,
    mixins: [MixInFaceDetect],
    //-------------------
    // Life cycle
    //-------------------
    mounted() {
      // App
      store.morph = new AppMorph()
      if (config.DEV) {
        store.morph.stats = stats
        store.morph.addGui(gui)
      }

      // Events
      store.keyboard.on('key', (input, pan) => {
        if (app.speakMode) {
          app.morph.say(input, pan)
        }
      })
      store.keyboard.on('fade', (x, y, needTextureUpdate) => {
        store.morph.setPosition(x, y, needTextureUpdate)
      })
      store.ime.on('change', (text) => {
        store.inputLogs.push(text)
        if (store.inputLogs.length > config.maxLogCount) {
          store.inputLogs.shift()
        }
        store.morph.conversation([text])
      })
      requestAnimationFrame(update)

      // Start speak
      store.morph.conversation(store.inputLogs, 1000)
    },
    watch: {
      pause(value) {
        console.log('pause changed', value)
        if (!value) {
          requestAnimationFrame(update)
        }
      }
    },
    computed: {
      speakMode: {
        get: () => {
          return store.morph ? store.morph.speakMode : true
        },
        set: (value) => {
          store.morph.speakMode = value
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
        // TODO: share with custom message
        ShareUtil.facebook({
          app_id: '143390209704075',
          href: 'https://invisi.jp/moface/'
        })
      },
      shareTwitterClick() {
        ShareUtil.twitter({
          text: 'MoFace',
          url: 'https://invisi.jp/moface/',
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
