// Entry point of all
import Modernizr from 'exports-loader?Modernizr!modernizr-custom'
import MobileDetect from 'mobile-detect'
import loadingBar from './js/loading-bar'
import Preloader from './js/preloader'
import manifest from './data/manifest'

{
  // Modernizr + MobileDetect Mix-in
  const md = new MobileDetect(navigator.userAgent)
  const grade = md.mobileGrade()
  Modernizr.addTest({
    mobile: !!md.mobile(),
    phone: !!md.phone(),
    tablet: !!md.tablet(),
    mobilegradea: grade === 'A'
  })
}

console.log('GitHub https://github.com/asus4/morph-identity')

if (!Modernizr.webaudio && !Modernizr.webgl) {
  // TODO no support fallback
  console.warn('No supported environment')
  loadingBar.finish()
} else {
  const preloader = new Preloader(manifest)
  preloader.on('progress', (n) => {
    loadingBar.progress = n
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
      const queue = preloader.queue
      assets.voices = manifest
        .filter((m) => {return m.id.startsWith('voice')})
        .map((m) => {return m.buffer})
      assets.faces = manifest
        .filter((m) => {return m.id.startsWith('face')})
        .map((m) => {return queue.getResult(m.src)})
      assets.textures.lut = queue.getResult('lut')
      assets.textures.depth = queue.getResult('depth')
      assets.textures.morphs = manifest
        .filter((m) => {return m.id.startsWith('morph')})
        .map((m) => {return queue.getResult(m.src)})

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
