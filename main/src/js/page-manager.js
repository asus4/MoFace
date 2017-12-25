const EventEmitter = require('events').EventEmitter

const onClick = (id, listener) => {
  document.getElementById(id).addEventListener('click', listener)
}

class PageManager extends EventEmitter {
  constructor() {
    super()

    onClick('about-button', () => {
      this.showModal('about')
    })
    onClick('makeface-button', () => {
      this.showModal('makeface')
    })
    onClick('cameraroll-button', () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.click()
    })
  }

  showModal(id) {
    const modal = document.getElementById(id)
    modal.classList.remove('hidden')
    this.emit('pause', true)

    const close = modal.querySelector('.close-button')
    close.addEventListener('click', () => {
      modal.classList.add('hidden')
      this.emit('pause', false)
    })
  }
}

export default new PageManager()
