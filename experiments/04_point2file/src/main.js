import clm from 'clmtrackr/build/clmtrackr'
import Editor from './editor'

const image = document.getElementById('image')
const tracker = new clm.tracker()
tracker.init()
const editor = new Editor(document.getElementById('overlay'))

function start(img) {
  image.getContext('2d').drawImage(img, 0, 0, 1024, 1024, 0, 0, 512, 512)
  tracker.start(image)
  requestAnimationFrame(trackLoop)
}

function trackLoop() {
  overlay.getContext('2d').clearRect(0, 0, 512, 512)

  const position = tracker.getCurrentPosition()
  if (position) {
    editor.start(position)
  } else {
    requestAnimationFrame(trackLoop)
  }
}

// Load button
document.getElementById('imageLoadButton').addEventListener('change', (e) => {
  const files = e.target.files
  if (files.length == 0) {
    return
  }
  const reader = new FileReader()
  reader.onloadend = (evt) => {
    if (evt.target.readyState == FileReader.DONE) { // DONE == 2
      const img = new Image()
      img.onload = () => {
        start(img)
      }
      img.src = evt.target.result
    }
  }
  reader.readAsDataURL(files[0])
}, false)

// Save button
document.getElementById('saveButton').addEventListener('onclick', () => {
  editor.save()
}, false)
