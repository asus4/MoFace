import MobileDetect from 'mobile-detect'

const mobileDetect = new MobileDetect(navigator.userAgent)

class LoadingBar {

  constructor() {
    this.background = document.getElementById('loading')
    this.progressBar = document.querySelector('#loading .bar')
    this.rate = 0
    this.finished = false
    this.update()
  }

  update() {
    if (!this.finished) {
      requestAnimationFrame(this.update.bind(this))
    }
    this.progressBar.style.width = `${this.rate * 100}%`
  }

  progress(rate) {
    this.rate = rate
    this.progressBar.style.width = `${this.rate * 100}%`
  }

  finish() {
    this.rate = 1
    this.finished = true
    this.progressBar.style.width = '100%'

    if (mobileDetect.mobile()) {
      this.showEnter()
    } else {
      this.fadeout()
    }
  }

  showEnter() {
    const hiddens = this.background.querySelectorAll('.fade.hidden')
    hiddens.forEach((d) => {
      d.classList.remove('hidden')
    })
    const button = this.background.querySelector('.button')
    button.addEventListener('click', () => {
      this.fadeout()
    })
  }

  fadeout() {
    this.background.style.opacity = 0
    setTimeout(() => {
      this.background.style.display = 'none'
    }, 1000)
  }
}

export default new LoadingBar()
