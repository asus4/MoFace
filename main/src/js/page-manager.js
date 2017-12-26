const EventEmitter = require('events').EventEmitter

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
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.addEventListener('change', (e) => {
        const files = e.target.files
        if (files.length == 0) {
          return
        }
        this.showModal('makeface-capture')
        this.emit('face-detect', files[0])
      })
      input.click()
    })

    // In confirm button
    onClick('#makeface-confirm .ok-button', () => {
      console.log('#makeface-confirm .ok-button', img)
      this.hideModal(this.currentModal)
      this.emit('new-face', img)
    })
    onClick('#makeface-confirm .retake-button', () => {
      const container = document.querySelector('#makeface-confirm .face-confirm')
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
