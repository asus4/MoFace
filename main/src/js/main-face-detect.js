import config from './config'

// Vue Mix-in Face Detect 
export default {
  methods: {
    resizePreview(container) {
      const fitWidth = container.clientWidth / container.clientHeight > config.aspect
      const children = [ ...container.children]
      children.forEach((element) => {
        if (fitWidth) {
          element.style.width = '100%'
          element.style.height = 'auto'
        } else {
          element.style.width = 'auto'
          element.style.height = '100%'
        }
      })
    }
  }
}
