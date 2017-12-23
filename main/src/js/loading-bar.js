class LoadingBar {

  progress(rate) {
    console.log('progress', rate)
  }

  finish() {
    console.log('finish')
  }
}

export default new LoadingBar()
