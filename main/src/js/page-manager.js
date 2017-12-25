const EventEmitter = require('events').EventEmitter

const onClick = (id, listener) => {
  document.getElementById(id).addEventListener('click', listener)
}

class PageManager extends EventEmitter {
  constructor() {
    super()

    // Top button
    onClick('about-button', () => {
      this.showModal('about')
    })
    onClick('makeface-button', () => {
      this.showModal('makeface')
    })

    // In capture button
    onClick('capture-button', () => {
      this.showModal('makeface-capture')

      this.emit('face-detect')
    })
    onClick('cameraroll-button', () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.click()
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
    close.addEventListener('click', () => {
      modal.classList.add('hidden')
      this.emit('pause', false)
    }, false)
  }

  hideModal(id) {
    this.currentModal = false

    const modal = document.getElementById(id)
    modal.classList.add('hidden')
    this.emit('pause', false)
  }
}

export default new PageManager()
