const EventEmitter = require('events').EventEmitter

import Modernizr from 'exports-loader?Modernizr!modernizr-custom'
import KEYMAP from './roma-ji'

// Touch screen mapping
const SCREENMAP = [
  ['あ', 'い', 'う', 'え', 'お'],
  ['か', 'き', 'く', 'け', 'こ'],
  ['さ', 'し', 'す', 'せ', 'そ'],
  ['た', 'ち', 'つ', 'て', 'と'],
  ['な', 'に', 'ぬ', 'ね', 'の'],
  ['は', 'ひ', 'ふ', 'へ', 'ほ'],
  ['ま', 'み', 'む', 'め', 'も'],
  ['や', 'ゆ', 'よ'],
  ['ら', 'り', 'る', 'れ', 'ろ'],
  ['わ', 'を', 'ん'],
]

// function remap(value, low1, high1, low2, high2) {
//   return low2 + (high2 - low2) * (value - low1) / (high1 - low1)
// }

function remapTrim(value, low1, high1, low2, high2) {
  const n = low2 + (high2 - low2) * (value - low1) / (high1 - low1)
  return Math.max(low2, Math.min(n, high2))
}

export default class VirtualKeyboard extends EventEmitter {
  constructor() {
    super()
    this.keyboard()
    if (Modernizr.touchevents) {
      this.touch()
    }
  }

  keyboard() {
    let inputs = ''
    let mouseX = 0
    window.addEventListener('mousemove', (e) => {
      mouseX = e.pageX / window.innerWidth
    })

    const checkKey = (keyCode) => {
      // is range of [A - Z]
      if (65 <= keyCode && keyCode <= 90) {
        inputs += String.fromCharCode(keyCode).toLowerCase()
        for (const input in KEYMAP) {
          if (inputs.startsWith(input)) {
            inputs = ''
            this.emit('key', KEYMAP[input], mouseX)
            break
          }
        }
      }
      // 'ん' N word check
      if (inputs.length > 1 && inputs[0] == 'n') {
        inputs = inputs.substr(1)
        this.emit('key', KEYMAP['nn'], mouseX)
      }
      // 'っ' word check
      if (inputs.length > 1 && inputs[0] == inputs[1]) {
        inputs = inputs.substr(1)
        checkKey(0)
      }
      // TOOD っぁぃぅぇぉ check
      if (inputs.length > 2) {
        inputs = inputs.substr(1)
        checkKey(0)
      }
      // console.log(inputs)
    }
    document.addEventListener('keydown', (e) => {checkKey(e.keyCode)})
  }

  touch() {
    let accX = 0
    window.addEventListener('devicemotion', (e) => {
      accX = remapTrim(e.accelerationIncludingGravity.x, -7, 7, 0, 1)
    })
    document.addEventListener('touchstart', (e) => {
      const p = [e.pageX / window.innerWidth, e.pageY / window.innerHeight]
      const y = Math.floor(p[1] * SCREENMAP.length)
      const x = Math.floor(p[0] * SCREENMAP[y].length)
      // console.log(p, y, x)
      this.emit('key', SCREENMAP[y][x], accX)
    })
  }
}
