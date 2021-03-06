const EventEmitter = require('events').EventEmitter
import KEYMAP from './roma-ji'
import config from './config'

const KANA = new RegExp(/[\u30a1-\u30f6]/, 'g')
const HIRA = new RegExp(/[\u3041-\u3096]/, 'g')
const AtoZ = new RegExp(/[a-z]/, 'g')

const convert = (str) => {
  // A to a
  str = str.toLowerCase()
  // カタカナ to ひらがな https://gist.github.com/kawanet/5553478
  return str.replace(KANA, (match) => {
    const chr = match.charCodeAt(0) - 0x60
    return String.fromCharCode(chr)
  })
}

const checkKey = (key) => {
  if (key.length == 0) {
    return null
  }
  if (key in KEYMAP) {
    return {lastKey: '', value: KEYMAP[key]}
  }
  // 'ん' N word check
  if (key.length > 1 && key[0] == 'n') {
    return {lastKey: key.substr(1), value: KEYMAP['nn']}
  }
  // 'っ' xtu word check
  if (key.length > 1 && key[0] == key[1]) {
    return {lastKey: key.substr(1), value: 'っ'}
  }
  return null
}

const shrink = (str) => {
  let hiragana = ''
  let romaji = ''

  for (const c of str) {
    if (c.match(AtoZ)) {
      // Alphabet
      romaji += c
      const res = checkKey(romaji)
      if (res != null) {
        hiragana += res.value
        romaji = res.lastKey
      }
    } else if (c.match(HIRA) != null) {
      // Hiragana
      hiragana += c
      romaji = ''
    } else {
      // Ignore other
      romaji = ''
    }
  }
  return hiragana
}

/* Test Code
console.time('kana-ime asset')
{
  console.assert(convert('アイウエオカキクケコ') === 'あいうえおかきくけこ')
  console.assert(convert('ABCED') === 'abced')
  console.assert(shrink('あいうえおaiueo') === 'あいうえおあいうえお')
  console.assert(shrink('aあiいuうeえoお') === 'ああいいううええおお')
  console.assert(shrink('nnjamena') === 'んじゃめな', shrink('nnjamena'))
  console.assert(shrink('njamena') === 'んじゃめな', shrink('njamena'))
  console.assert(shrink('nipponn') === 'にっぽん', shrink('nipponn'))
}
console.timeEnd('kana-ime asset')
*/

export default class KanaIME  extends EventEmitter {
  constructor() {
    super()
  }

  onInput(event) {
    if (!config.mobile) {
      const t = event.target
      t.value = convert(t.value)
    }
  }

  onChange(event) {
    const t = event.target
    const text = shrink(convert(t.value))
    if (text.length > 0) {
      this.emit('change', text)
    }
    t.value = ''
  }
}
