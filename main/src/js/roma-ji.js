// Roma-ji style Input Mapping
// https://ja.wikipedia.org/wiki/%E3%83%AD%E3%83%BC%E3%83%9E%E5%AD%97%E5%85%A5%E5%8A%9B

export default {
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
  di: 'じ', // symlink
  du: 'ず', // symlink
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
  wyi: 'い', // symlink
  wye: 'え', // symlink
  wo: 'お', // symlink
  'n\'': 'ん',
  nn: 'ん',

  kya: 'きゃ',
  kyu: 'きゅ',
  kyo: 'きょ',
  gya: 'ぎゃ',
  gyu: 'ぎゅ',
  gyo: 'ぎょ',

  sya: 'しゃ',
  sha: 'しゃ',
  syu: 'しゅ',
  shu: 'しゅ',
  syo: 'しょ',
  sho: 'しょ',

  zya: 'じゃ',
  ja: 'じゃ',
  zyu: 'じゅ',
  ju: 'じゅ',
  zyo: 'じょ',
  jo: 'じょ',

  tya: 'ちゃ',
  cha: 'ちゃ',
  tyu: 'ちゅ',
  chu: 'ちゅ',
  tyo: 'ちょ',
  cho: 'ちょ',

  dya: 'じゃ', // symlink
  dyu: 'じゅ', // symlink
  dyo: 'じょ', // symlink

  nya: 'にゃ',
  nyu: 'にゅ',
  nyo: 'にょ',

  hya: 'ひゃ',
  hyu: 'ひゅ',
  hyo: 'ひょ',

  bya: 'びゃ',
  byu: 'びゅ',
  byo: 'びょ',

  pya: 'ぴゃ',
  pyu: 'ぴゅ',
  pyo: 'ぴょ',

  mya: 'みゃ',
  myu: 'みゅ',
  myo: 'みょ',

  rya: 'りゃ',
  ryu: 'りゅ',
  ryo: 'りょ',

  // https://ja.wikipedia.org/wiki/%E6%8B%97%E9%9F%B3
  isYoon: (c) => {
    switch (c) {
      case 'ゃ':
      case 'ゅ':
      case 'ょ':
        return true
    }
    return false
  },
}

