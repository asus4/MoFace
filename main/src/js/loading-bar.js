class LoadingBar {

  constructor(dom) {
    this.dom = dom
    this.rate = 0
    this.finished = false
    this.update()
  }

  update() {
    if (!this.finished) {
      requestAnimationFrame(this.update.bind(this))
    }
    this.dom.style.width = `${this.rate * window.innerWidth}px`
  }

  progress(rate) {
    this.rate = rate
    this.dom.style.width = `${this.rate * window.innerWidth}px`
  }

  finish() {
    this.rate = 1
    this.finished = true
    this.dom.style.width = `${window.innerWidth}px`
    this.dom.style.visibility = 'hidden'
    this.dom.style.opacity = 0
    this.dom.style.display = 'none'
  }
}

export default new LoadingBar(document.getElementById('loading'))
