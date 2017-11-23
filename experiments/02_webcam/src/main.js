import dat from 'dat-gui'
import Tone from 'tone'
import StartAudioContext from './StartAudioContext'

const gui = new dat.GUI()

const video = document.getElementById('video')
video.muted = true
const canvas = document.getElementById('canvas')

const ctx = canvas.getContext('2d')
canvas.width  = window.innerWidth
canvas.height = window.innerHeight




function setup(stream) {
  console.log('success')
  // on success  
  video.srcObject = stream
  video.play()

  const source = Tone.context.createMediaStreamSource(stream)
  const autoWah = new Tone.AutoWah()
  source.connect(autoWah)
  autoWah.toMaster()

  gui.add(autoWah.wet, 'value', 0.0, 1.0)
  gui.add(autoWah, 'baseFrequency', 100, 1500)
  console.log('audio buffer initialized')


  canvas.addEventListener('touchmove', (e) => {
    console.log('move', e.touches[0].clientX, e.touches.clientY)
    autoWah.baseFrequency = e.touches[0].clientX * 10
  }, false)
}


function update() {
  ctx.drawImage(video, 0, 0)
  requestAnimationFrame(update)
}


StartAudioContext(Tone.context, canvas, () => {
  navigator.getUserMedia({
    audio: true,
    video: {
      facingMode: 'user' // use facing camera
    }
  }, setup, (err) => {
    // on error
    console.warn(err)
  })
})





requestAnimationFrame(update)
