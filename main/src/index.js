// Entry point of all
import Modernizr from 'exports-loader?Modernizr!modernizr-custom'
import createjs from 'preload-js'
import loadingBar from './js/loading-bar'
import Preloader from './js/preloader'

console.log('GitHub https://github.com/asus4/morph-identity')

if (!Modernizr.webaudio && !Modernizr.webgl) {
  // TODO no support fallback
  console.warn('No supported environment')
  loadingBar.finish()
} else {

  // Preloader setup
  const TYPE_AUDIO = createjs.LoadQueue.BINARY
  const manifest = [
    // Sounds
    {id: 'voice-iwata', src: './data/iwata.mp3', type: TYPE_AUDIO, weight: 3},
    {id: 'voice-kogawa', src: './data/kogawa.mp3', type: TYPE_AUDIO, weight: 3},
    {id: 'voice-matsuo', src: './data/matsuo.mp3', type: TYPE_AUDIO, weight: 3},
    {id: 'voice-noda', src: './data/noda.mp3', type: TYPE_AUDIO, weight: 3},
    {id: 'voice-otabe', src: './data/otabe.mp3', type: TYPE_AUDIO, weight: 3},

    // Images
    // TODO: Might be better to use smaller image on mobile
    {id: 'face-iwata', src: './data/iwata.jpg', weight: 1},
    {id: 'face-kogawa', src: './data/kogawa.jpg', weight: 1},
    {id: 'face-matsuo', src: './data/matsuo.jpg', weight: 1},
    {id: 'face-noda', src: './data/noda.jpg', weight: 1},
    {id: 'face-otabe', src: './data/otabe.jpg', weight: 1},

    // Texture
    {id: 'lut', src: './textures/lut.png', weight: 1}
  ]

  const preloader = new Preloader(manifest)
  preloader.on('progress', (n) => {
    loadingBar.progress(n)
  })
  preloader.load()

  // Load main module
  // Couldn't use dynamic import since ESLint problem.
  // import('./main').then((res) => {
  require.ensure([], () => {
    const main = require('./js/main').default

    const start = () => {
      // set assets
      const assets = require('./js/assets').default
      assets.buffers = manifest
        .filter((m) => {return m.id.startsWith('voice')})
        .map((m) => {return m.buffer})
      assets.images = manifest
        .filter((m) => {return m.id.startsWith('face')})
        .map((m) => {return preloader.queue.getResult(m.src)})
      assets.lut = preloader.queue.getResult('lut')

      main()

      loadingBar.finish()
      preloader.dispose()
    }

    if (preloader.completed) {
      start()
    } else {
      preloader.on('complete', start)
    }

  })
}
