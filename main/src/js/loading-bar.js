import MobileDetect from 'mobile-detect'

const mobileDetect = new MobileDetect(navigator.userAgent)
const isMobile = mobileDetect.mobile()

class LoadingBar {
  constructor() {
    this.background = document.getElementById('loading')
    this.progressBar = this.background.querySelector('.bar')
    this.progressCircle = this.background.querySelector('circle')

    this.progress = 0
    this.smoothProgress = 0

    this.finished = false
    this.update()
  }

  update() {
    if (!this.finished) {
      requestAnimationFrame(this.update.bind(this))
    }
    this.smoothProgress += (this.progress - this.smoothProgress) * 0.1
    this._setProgress(this.smoothProgress)
  }

  finish() {
    this.smoothProgress = this.progress = 1
    this.finished = true

    if (isMobile) {
      this.showEnter()
    } else {
      this.fadeout()
    }
  }

  showEnter() {
    const container = this.background.querySelector('#loading .container.mobile-only')
    const hiddens = container.querySelectorAll('.hidden')
    hiddens.forEach((d) => {
      d.classList.remove('hidden')
      d.classList.add('fade')
    })
    container.querySelector('.loading').classList.add('hidden')
    this.background.addEventListener('click', () => {
      this.fadeout()
    }, false)
  }

  fadeout() {
    this.background.style.opacity = 0
    setTimeout(() => {
      this.background.style.display = 'none'
    }, 1000)
  }

  _setProgress(value) {
    if (isMobile) {
      this.progressBar.style.width = `${value * 100}%`
    } else {
      const len = this.progressCircle.getTotalLength()
      this.progressCircle.style.strokeDasharray = `${len} ${len}`
      this.progressCircle.style.strokeDashoffset = (1 - value) * len
    }
  }
}

export default new LoadingBar()
