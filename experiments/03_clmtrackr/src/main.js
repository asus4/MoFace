import clm from 'clmtrackr/build/clmtrackr'
import Stats from 'stats.js'

const video = document.getElementById('video')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const tracker = new clm.tracker()
tracker.init()

function setup(stream) {
  // on success  
  video.srcObject = stream
  video.onloadedmetadata = onVideoResize
  video.onresize = onVideoResize
  video.play()


  requestAnimationFrame(update)
}

function update() {
  requestAnimationFrame(update)

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(video, 0, 0)

  const positions = tracker.getCurrentPosition()
  if (positions) {
    tracker.draw(canvas)
  }
}

function onVideoResize() {
  video.width = video.videoWidth
  video.height = video.videoHeight
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  tracker.stop()
  tracker.reset()
  tracker.start(video)
  // video.style.width = canvas.style.width = `${w}px`
}

navigator.getUserMedia({
  audio: true,
  video: {
    facingMode: 'user' // use facing camera
  }
}, setup, (err) => {
  // on error
  console.warn(err)
})


// Stats
const stats = new Stats()
stats.domElement.style.position = 'absolute'
stats.domElement.style.top = '0px'
document.getElementById('container').appendChild( stats.domElement )
document.addEventListener('clmtrackrIteration', () => {
  stats.update()
}, false)
