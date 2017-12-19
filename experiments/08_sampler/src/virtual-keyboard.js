const EventEmitter = require('events').EventEmitter

const KEYMAP = {
  a: 'あ',
  i: 'い',
  u: 'う',
  e: 'え',
  o: 'お',
  ka: 'か',
  ki: 'き',
  ku: 'く',
  ke: 'け',
  ko: 'こ',
  ga: 'が',
  gi: 'ぎ',
  gu: 'ぐ',
  ge: 'げ',
  go: 'ご',
  sa: 'さ',
  si: 'し',
  shi: 'し',
  su: 'す',
  se: 'せ',
  so: 'そ',
  za: 'ざ',
  zi: 'じ',
  ji: 'じ',
  zu: 'ず',
  ze: 'ぜ',
  zo: 'ぞ',
  ta: 'た',
  ti: 'ち',
  chi: 'ち',
  tu: 'つ',
  tsu: 'つ',
  te: 'て',
  to: 'と',
  da: 'だ',
  di: 'ぢ',
  du: 'づ',
  de: 'で',
  do: 'ど',
  na: 'な',
  ni: 'に',
  nu: 'ぬ',
  ne: 'ね',
  no: 'の',
  ha: 'は',
  hi: 'ひ',
  hu: 'ふ',
  fu: 'ふ',
  he: 'へ',
  ho: 'ほ',
  ba: 'ば',
  bi: 'び',
  bu: 'ぶ',
  be: 'べ',
  bo: 'ぼ',
  pa: 'ぱ',
  pi: 'ぴ',
  pu: 'ぷ',
  pe: 'ぺ',
  po: 'ぽ',
  ma: 'ま',
  mi: 'み',
  mu: 'む',
  me: 'め',
  mo: 'も',
  ra: 'ら',
  ri: 'り',
  ru: 'る',
  re: 'れ',
  ro: 'ろ',
  ya: 'や',
  yu: 'ゆ',
  yo: 'よ',
  wa: 'わ',
  wo: 'を',
  nn: 'ん',
}

const SCREENMAP = [
  ['あ', 'い', 'う', 'え', 'お'],
  ['か', 'き', 'く', 'け', 'こ'],
  ['さ', 'し', 'す', 'せ', 'そ'],
  ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'],
  ['た', 'ち', 'つ', 'て', 'と'],
  ['だ', 'ぢ', 'づ', 'で', 'ど'],
  ['な', 'に', 'ぬ', 'ね', 'の'],
  ['は', 'ひ', 'ふ', 'へ', 'ほ'],
  ['ば', 'び', 'ぶ', 'べ', 'ぼ'],
  ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
  ['ま', 'み', 'む', 'め', 'も'],
  ['や', 'ゆ', 'よ'],
  ['ら', 'り', 'る', 'れ', 'ろ'],
  ['わ', 'を', 'ん'],
]


function remap(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1)
}

function remapTrim(value, low1, high1, low2, high2) {
  const n = low2 + (high2 - low2) * (value - low1) / (high1 - low1)
  return Math.max(low2, Math.min(n, high2))
}


export default class VirtualKeyboard extends EventEmitter {
  constructor(dom) {
    super()
    this.keyboard(dom)
    this.touch(dom)

    this.dom = dom
  }

  keyboard(dom) {
    let inputs = ''
    let mouseX = 0
    window.addEventListener('mousemove', (e) => {
      mouseX = e.pageX / window.innerWidth
    })
    dom.addEventListener('keydown', (e) => {
      inputs += e.key.toLowerCase()
      for (const input in KEYMAP) {
        if (inputs.startsWith(input)) {
          inputs = ''
          this.emit('key', KEYMAP[input], mouseX)
          break
        }
      }
      if (inputs.length > 3) {
        inputs = ''
      }
    })
  }

  touch() {
    let accX = 0
    window.addEventListener('devicemotion', (e) => {
      accX = remapTrim(e.accelerationIncludingGravity.x, -7, 7, 0, 1)
    })
    document.addEventListener('touchstart', (e) => {
      console.log(e)
      const p = [e.pageX / window.innerWidth, e.pageY / window.innerHeight]
      const y = Math.floor(p[1] * SCREENMAP.length)
      const x = Math.floor(p[0] * SCREENMAP[y].length)
      console.log(p, y, x)
      this.emit('key', SCREENMAP[y][x], accX)
    })
  }
}
