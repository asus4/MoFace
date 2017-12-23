// Entry point of all
import Modernizr from 'exports-loader?Modernizr!../web_modules/modernizr-custom'
import createjs from 'preload-js'
import loadingBar from './js/loading-bar'
import Preloader from './js/preloader'

console.log('author:@asus4 see https://github.com/asus4/morph-identity')

if (!Modernizr.webaudio && !Modernizr.webgl) {
  // TODO fallback
  console.warn('No supported environment')
  loadingBar.finish()
} else {

  // Preloader setup
  const _BINARY_TYPE = createjs.LoadQueue.BINARY
  const manifest = [
    {id: 'sound-kogawa', src: './data/kogawa.mp3', type: _BINARY_TYPE, weight: 3},
    {id: 'sound-ryuuta', src: './data/ryuuta.mp3', type: _BINARY_TYPE, weight: 3},
  ]

  const preloader = new Preloader(manifest)
  preloader.on('progress', (n) => {
    loadingBar.progress(n)
  })
  preloader.load()

  // Load main module
  // Couldn't use dynamic import since ESLint program.
  // import('./main').then((res) => {
  require.ensure([], () => {
    const main = require('./main').default
    const start = () => {
      // main(preloader.queue)
      main(manifest)
      loadingBar.finish()
    }

    if (preloader.completed) {
      start()
    } else {
      preloader.on('complete', start)
    }

  })
}
