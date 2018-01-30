import createjs from 'preload-js'
const TYPE_AUDIO = createjs.LoadQueue.BINARY
const manifest = [
  // Sounds
  {id: 'voice-iwata', src: './members/iwata.mp3', type: TYPE_AUDIO, weight: 3},
  {id: 'voice-kikuchi', src: './members/kikuchi.mp3', type: TYPE_AUDIO, weight: 3},
  {id: 'voice-kiyokawa', src: './members/kiyokawa.mp3', type: TYPE_AUDIO, weight: 3},
  {id: 'voice-kogawa', src: './members/kogawa.mp3', type: TYPE_AUDIO, weight: 3},
  {id: 'voice-matsuo', src: './members/matsuo.mp3', type: TYPE_AUDIO, weight: 3},
  {id: 'voice-nakamura', src: './members/nakamura.mp3', type: TYPE_AUDIO, weight: 3},
  {id: 'voice-noda', src: './members/noda.mp3', type: TYPE_AUDIO, weight: 3},
  {id: 'voice-onodera', src: './members/onodera.mp3', type: TYPE_AUDIO, weight: 3},
  {id: 'voice-otabe', src: './members/otabe.mp3', type: TYPE_AUDIO, weight: 3},
  {id: 'voice-takaki', src: './members/takaki.mp3', type: TYPE_AUDIO, weight: 3},

  // Images
  // TODO: Might be better to use smaller image on mobile
  {id: 'face-iwata', src: './members/iwata.jpg', weight: 1},
  {id: 'face-kikuchi', src: './members/kikuchi.jpg', weight: 1},
  {id: 'face-kiyokawa', src: './members/kiyokawa.jpg', weight: 1},
  {id: 'face-kogawa', src: './members/kogawa.jpg', weight: 1},
  {id: 'face-matsuo', src: './members/matsuo.jpg', weight: 1},
  {id: 'face-nakamura', src: './members/nakamura.jpg', weight: 1},
  {id: 'face-noda', src: './members/noda.jpg', weight: 1},
  {id: 'face-onodera', src: './members/onodera.jpg', weight: 1},
  {id: 'face-otabe', src: './members/otabe.jpg', weight: 1},
  {id: 'face-takaki', src: './members/takaki.jpg', weight: 1},

  // Texture
  {id: 'lut', src: './textures/lut.png', weight: 1},
  {id: 'depth', src: './textures/depth.jpg', weight: 1},
  {id: 'circle', src: './textures/circle.png', weight: 1},

  // JS
  {src: 'clmtrackr.min.js', weight: 1},
]

export default manifest
