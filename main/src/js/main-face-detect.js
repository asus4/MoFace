import AppFaceDetect from './app-face-detect'
import config from './config'
import {openPhotoLibrary} from './async'

const store = {
  detect: {
    scene: '',
    detector: null,
    resultImage: null,
    resultPoints: null,
    useVideo: false,
    file: null,
  }
}

// Vue Mix-in Face Detect
export default {
  data: store,
  methods: {
    // Face detect
    makeFaceClick() {
      this.detect.scene = 'select'
      this.pause = true
    },
    makeFaceCancel() {
      if (this.detect.detector) {
        this.detect.detector.dispose()
        this.detect.detector = null
      }
      this.detect.scene = ''
      this.detect.file = null
      this.pause = false
    },
    startWebcamFaceDetect() {
      this.useVideo = true
      this.initFaceDetect(null)
    },
    startPhotoFaceDetect() {
      this.useVideo = false
      openPhotoLibrary().then((file) => {
        this.initFaceDetect(file)
      })
    },
    initFaceDetect(file) {
      this.detect.resultImage = null
      this.detect.resultPoints = null
      this.detect.detector = new AppFaceDetect(this.stats)
      this.detect.file = file
      this.detect.scene = 'capture'
      this.detect.detector.on('capture', (img, points) => {
        this.detect.resultImage = img
        this.detect.resultPoints = points
        this.detect.scene = 'confirm'
        this.detect.detector.dispose()
        this.detect.detector = null
      })
    },
    onEnterFaceDetect() {
      // Set canvas refs
      const detector = this.detect.detector
      detector.overlay = this.$refs.detectFaceOverlay
      detector.canvas = this.$refs.detectFaceCanvas
      detector.ctx = detector.canvas.getContext('2d')

      this.resizePreview(detector.overlay.parentNode)

      if (this.useVideo) {
        detector.startCamera(this.$refs.detectFaceVideo)
      } else {
        detector.startImage(this.detect.file)
      }

    },
    addNewFace() {
      this.morph.addFace(this.detect.resultImage, this.detect.resultPoints)
      this.detect.scene = ''
      this.detect.file = null
      this.detect.resultImage = null
      if (this.detect.detector) {
        this.detect.detector.dispose()
        this.detect.detector = null
      }
      this.pause = false
    },
    /**
     * @param {HTMLElement} container
     */
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
