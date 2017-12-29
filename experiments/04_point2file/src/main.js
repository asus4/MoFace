import clm from 'clmtrackr'
import {saveAs} from 'file-saver'
import Editor from './editor'

const image = document.getElementById('image')
const tracker = new clm.tracker()
tracker.init()

let editor = null
let converged = false
let trackStart = performance.now()

const start = (img) => {
  const width = img.width
  const height = img.height
  {
    // Resize canvas
    document.querySelectorAll('canvas').forEach((element) => {
      element.width = width
      element.height = height
    })
    const container = document.getElementById('container')
    container.style.width = `${width}px`
    container.style.height = `${height}px`
  }
  image.getContext('2d').drawImage(img, 0, 0, width, height)



  document.addEventListener('clmtrackrConverged', () => {
    converged = true
  }, false)
  document.removeEventListener('clmtrackrNotFound', () => {
    console.log('clmtrackrNotFound')
  }, false)
  document.removeEventListener('clmtrackrLost', () => {
    console.log('clmtrackrNotFound')
  }, false)

  selectFaceArea()
}

const selectFaceArea = () => {
  const overlay = document.getElementById('overlay')
  const ctx = overlay.getContext('2d')
  ctx.lineWidth = 2
  ctx.strokeStyle = '#00FF00'
  const rect = {
    x: 0, y: 0, width: 10, height: 10
  }

  const onMouse = (e) => {
    if (e.type === 'mousedown') {
      rect.x = e.offsetX
      rect.y = e.offsetY
    } else if (e.type === 'mousemove') {
      rect.width = e.offsetX - rect.x
      rect.height = e.offsetY - rect.y
    } else if (e.type === 'mouseup') {
      rect.width = e.offsetX - rect.x
      rect.height = e.offsetY - rect.y
      overlay.removeEventListener('mousedown', onMouse, false)
      overlay.removeEventListener('mousemove', onMouse, false)
      overlay.removeEventListener('mouseup', onMouse, false)
      startTrack(rect)
    }
    ctx.clearRect(0, 0, overlay.width, overlay.height)
    ctx.rect(rect.x, rect.y, rect.width, rect.height)
    ctx.stroke()

  }

  overlay.addEventListener('mousedown', onMouse, false)
  overlay.addEventListener('mousemove', onMouse, false)
  overlay.addEventListener('mouseup', onMouse, false)


}

const startTrack = (rect) => {
  tracker.start(image, [rect.x, rect.y, rect.width, rect.height])
  editor = new Editor(document.getElementById('overlay'))
  trackStart = performance.now()
  requestAnimationFrame(trackLoop)
}


const trackLoop = (now) => {
  const trackTime = now - trackStart
  overlay.getContext('2d').clearRect(0, 0, overlay.width, overlay.height)

  const position = tracker.getCurrentPosition()
  if (position && converged) { // timeout 10sec
    editor.start(position)
  } else if (position && trackTime > 10000) { // timeout 10sec
    console.warn('timeout')
    editor.start(position)
  } else {
    tracker.draw(overlay)
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
document.getElementById('saveButton').addEventListener('click', () => {
  const points = editor.export()
  const blob = new Blob([JSON.stringify(points)], {type: 'text/json;charset=utf-8'})
  saveAs(blob, 'points.json')
}, false)
