import {EventEmitter} from 'events'

import Modernizr from 'exports-loader?Modernizr!modernizr-custom'
import KEYMAP from './roma-ji'
import {remapTrim} from './math'

// Touch screen mapping
const SCREENMAP = [
  ['あ', 'い', 'う', 'え', 'お'],
  ['か', 'き', 'く', 'け', 'こ'],
  ['さ', 'し', 'す', 'せ', 'そ'],
  ['た', 'ち', 'つ', 'て', 'と'],
  ['な', 'に', 'ぬ', 'ね', 'の'],
  ['は', 'ひ', 'ふ', 'へ', 'ほ'],
  ['ま', 'み', 'む', 'め', 'も'],
  ['や', 'や', 'ゆ', 'よ', 'よ'], // irregular
  ['ら', 'り', 'る', 'れ', 'ろ'],
  ['わ', 'や', 'お', 'ん', 'ん'], // irregular
]

const drawTouchGrids = (canvas) => {
  const rect = canvas.getBoundingClientRect()
  const width = canvas.width = rect.width
  const height = canvas.height = rect.height
  const ctx = canvas.getContext('2d')

  ctx.beginPath()
  ctx.lineWidth = 1
  ctx.strokeStyle = '#fff'

  const ylen = SCREENMAP.length
  for (let j = 1; j < ylen; ++j) {
    const xlen = SCREENMAP[j].length
    for (let i = 1; i < xlen; ++i) {
      // Draw cross
      const x = Math.round(i * width / xlen)
      const y = Math.round(j * height / ylen)
      ctx.moveTo(x, y - 3)
      ctx.lineTo(x, y + 3)
      ctx.moveTo(x - 3, y)
      ctx.lineTo(x + 3, y)
    }
  }
  ctx.stroke()
}


export default class VirtualKeyboard extends EventEmitter {
  constructor() {
    super()
    this.keyboard()
    if (Modernizr.touchevents) {
      this.addX = 0
      window.addEventListener('devicemotion', (e) => {
        this.accX = remapTrim(e.accelerationIncludingGravity.x, -6, 6, 0, 1)
        const accY = remapTrim(e.accelerationIncludingGravity.y, -6, 6, 0, 1)
        this.emit('fade', this.accX, accY, false)
      }, false)
    }
    this.lastVoice = ''
  }

  drawGrids(target) {
    drawTouchGrids(target)
  }

  keyboard() {
    let inputs = ''
    let mouseX = 0
    let mouseY = 0
    const marginY = 118
    const marginX = 210
    window.addEventListener('mousemove', (e) => {
      mouseX = remapTrim(e.pageX, marginX, window.innerWidth - marginX, 0, 1)
      mouseY = remapTrim( e.pageY, marginY, window.innerHeight - marginY, 0, 1)
      this.emit('fade', mouseX, 1 - mouseY, true)
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
    document.addEventListener('keydown', (e) => {checkKey(e.keyCode)}, false)
  }

  onTouch(e, force = false) {
    const touch = e.touches[0]
    const rect = e.target.getBoundingClientRect()
    const p = [(touch.clientX - rect.left) / rect.width, (touch.clientY - rect.top) / rect.height]
    const y = Math.floor(p[1] * SCREENMAP.length)
    const x = Math.floor(p[0] * SCREENMAP[y].length)

    this.emit('fade', p[0], 1 - p[1], true)

    const voice = SCREENMAP[y][x]
    if (force || this.lastVoice != voice) {
      this.emit('key', voice, this.accX)
      this.lastVoice = voice
    }
  }
}
