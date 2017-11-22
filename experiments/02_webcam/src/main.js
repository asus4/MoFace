console.log('started')

const video = document.getElementById('video')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
canvas.width  = window.innerWidth
canvas.height = window.innerHeight

navigator.getUserMedia({
  audio: true,
  video: {
    facingMode: 'user'
  }
}, (stream) => {
  // on success  
  video.srcObject = stream
  video.play()
  console.log('success')
}, (err) => {
  // on error
  console.warn(err)
})

function draw() {
  ctx.drawImage(video, 0, 0)
  requestAnimationFrame(draw)
}
requestAnimationFrame(draw)
