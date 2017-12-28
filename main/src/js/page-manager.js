const EventEmitter = require('events').EventEmitter
import {openPhotoLibrary} from './async'
import ShareUtil from './share-util'

const onClick = (query, listener) => {
  document.querySelector(query).addEventListener('click', listener)
}

class PageManager extends EventEmitter {
  constructor() {
    super()

    //-----------------------
    // Top button
    onClick('#info-button', () => {
      this.showModal('info')
    })
    onClick('#makeface-button', () => {
      this.showModal('makeface')
    })
    onClick('#mode-button', () => {
      this.emit('mode-toggle')
    })

    //-----------------------
    // In capture button
    onClick('#capture-button', () => {
      this.showModal('makeface-capture')
      this.emit('face-detect', false)
    })
    onClick('.legal.button', () => {
      this.showModal('makeface-legal')
    })

    //-----------------------
    // Makeface - Load from camera roll
    onClick('#cameraroll-button', () => {
      openPhotoLibrary().then((file) => {
        const page = this.showModal('makeface-capture')
        page.querySelectorAll('.guide').forEach((e) => {
          e.classList.add('hidden')
        })
        this.emit('face-detect', file)
      })
    })

    //-----------------------
    // Makeface - Confirm button
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

    //-----------------------
    // Text input
    onClick('footer .button.keyboard', () => {
      console.log('button keyboard')
      const input = document.querySelector('footer input')
      console.log(input)
      input.focus()
    })

    //-----------------------
    // Share
    onClick('a.facebook', () => {
      ShareUtil.facebook({
        app_id: '12345678',
        href: 'https://https://invisi.jp/'
      })
    })
    onClick('a.twitter', () => {
      ShareUtil.twitter({
        text: '新年のあいさつ',
        url: 'https://https://invisi.jp/',
        hashtags: 'moface'
      })
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
