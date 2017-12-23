#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// モーラの一覧
// https://ja.wikipedia.org/wiki/%E6%97%A5%E6%9C%AC%E8%AA%9E%E3%81%AE%E9%9F%B3%E9%9F%BB#%E3%83%A2%E3%83%BC%E3%83%A9%E3%81%AE%E4%B8%80%E8%A6%A7
const MORA = [
  'あ', 'い', 'う', 'え', 'お',
  'か', 'き', 'く', 'け', 'こ',
  'が', 'ぎ', 'ぐ', 'げ', 'ご',
  'さ', 'し', 'す', 'せ', 'そ',
  'ざ', 'じ', 'ず', 'ぜ', 'ぞ',
  'た', 'ち',  'つ', 'て', 'と',
  'だ',  'で', 'ど',
  'な', 'に', 'ぬ', 'ね', 'の',
  'は', 'ひ', 'ふ', 'へ', 'ほ',
  'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ',
  'ば', 'び', 'ぶ', 'べ', 'ぼ',
  'ま', 'み', 'む', 'め', 'も',
  'ら', 'り', 'る', 'れ', 'ろ',
  'わ',
  'や', 'ゆ', 'よ',
  'きゃ', 'きゅ', 'きょ',
  'ぎゃ', 'ぎゅ', 'ぎょ',
  'しゃ', 'しゅ', 'しょ',
  'じゃ', 'じゅ', 'じょ',
  'ちゃ', 'ちゅ', 'ちょ',
  'にゃ', 'にゅ', 'にょ',
  'ひゃ', 'ひゅ', 'ひょ',
  'ぴゃ', 'ぴゅ', 'ぴょ',
  'びゃ', 'びゅ', 'びょ',
  'みゃ', 'みゅ', 'みょ',
  'りゃ', 'りゅ', 'りょ',
  'ん',
]

function main(in_paths, out_path) {
  if (in_paths.length != 101) {
    throw new Error( `${101 - in_paths.length} files are missing`)
  }
  const exportPathes = []

  for (const inPath of in_paths) {
    const baseName = path.basename(inPath)
    const index = parseInt(baseName)
    if (index == NaN) {
      throw new Error('File name is not start with with Number')
    }
    const result = path.join(out_path, `${MORA[index - 1]}.wav`)
    fs.copyFileSync(inPath, result)
    exportPathes.push(result)
    console.log(index, MORA[index - 1], baseName)
  }
  return exportPathes
}

if (require.main == module)  {
  // Run as command line script
  const out_path = process.argv[2]
  const in_paths = process.argv.slice(3)
  main(in_paths, out_path)
} else {
  // Excute as module
  module.exports = main
}
