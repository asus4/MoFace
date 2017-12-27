const EventEmitter = require('events').EventEmitter
import {openPhotoLibrary} from './async'


const onClick = (query, listener) => {
  document.querySelector(query).addEventListener('click', listener)
}

class PageManager extends EventEmitter {
  constructor() {
    super()

    // Top button
    onClick('#info-button', () => {
      this.showModal('info')
    })
    onClick('#makeface-button', () => {
      this.showModal('makeface')
    })

    // In capture button
    onClick('#capture-button', () => {
      this.showModal('makeface-capture')
      this.emit('face-detect', false)
    })

    // Load from camera roll
    onClick('#cameraroll-button', () => {
      openPhotoLibrary().then((file) => {
        const page = this.showModal('makeface-capture')
        page.querySelectorAll('.guide').forEach((e) => {
          e.classList.add('hidden')
        })
        this.emit('face-detect', file)
      })
    })

    // In confirm button
    onClick('#makeface-confirm .ok-button', () => {
      const img = document.querySelector('#makeface-confirm img')
      console.log('#makeface-confirm .ok-button', img)
      this.hideModal(this.currentModal)
      this.emit('new-face', img)
    })
    onClick('#makeface-confirm .retake-button', () => {
      const container = document.querySelector('#makeface-confirm .preview')
      container.removeChild(container.lastChild)
      this.showModal('makeface')
    })

    this.currentModal = false
  }

  showModal(id) {
    if (this.currentModal) {
      this.hideModal(this.currentModal)
    }
    this.currentModal = id

    const modal = document.getElementById(id)
    modal.classList.remove('hidden')
    this.emit('pause', true)
    const close = modal.querySelector('.close-button')
    if (close) {
      close.addEventListener('click', () => {
        modal.classList.add('hidden')
        this.emit('pause', false)
      }, false)
    }

    return modal
  }

  hideModal(id) {
    this.currentModal = false

    const modal = document.getElementById(id)
    modal.classList.add('hidden')
    this.emit('pause', false)

    return modal
  }

}

// export as Singleton
export default new PageManager()
