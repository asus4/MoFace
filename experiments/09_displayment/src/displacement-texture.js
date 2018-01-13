const textureLoader = new THREE.TextureLoader()

export default class DisplacementTexture extends THREE.WebGLRenderTarget {
  /**
   * Creates an instance of DisplacementTexture.
   * @param {THREE.WebGLRenderer} renderer 
   * @memberof DisplacementTexture
   */
  constructor(renderer) {
    super(512, 512, {depthBuffer: false, stencilBuffer: false})

    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(0, 1, 1, 0, -10, 10)
    this.renderer = renderer

    this._fadeMap = 2
    this.fadeMaps = [
      'textures/morph0.png',
      'textures/morph1.png',
      'textures/morph2.png',
    ].map((path) => {return textureLoader.load(path)})

    const geometry = new THREE.PlaneGeometry(1, 1, 1, 1)
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        map: {type: 't', value: this.fadeMaps[this._fadeMap]},
        learningRate: {type: 'f', value: 0.1},
      },
      vertexShader: require('./shaders/basic-transform.vert'),
      fragmentShader: require('./shaders/displacement.frag'),
      transparent: true,
    })
    const background = new THREE.Mesh(geometry, this.material)
    background.position.set(0.5, 0.5, 0)
    this.scene.add(background)
  }

  render() {
    this.renderer.autoClear = false
    this.renderer.render(this.scene, this.camera, this, false)
    this.renderer.autoClear = true
  }

  createDebugMesh() {
    const geometry = new THREE.PlaneGeometry(1, 1, 1, 1)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        map: {tyep: 't', value: this.texture},
      },
      vertexShader: require('./shaders/basic-transform.vert'),
      fragmentShader: require('./shaders/displacement-debug.frag'),
    })
    const mesh = new THREE.Mesh(geometry, material)
    return mesh
  }

  updatePosition(x, y) {
    console.log(x, y)
  }

  get fadeMap() {
    return this._fadeMap
  }

  set fadeMap(value) {
    this._fadeMap = value
    this.material.uniforms.map.value = this.fadeMaps[value]
    this.fadeMaps[value].needsUpdate = true
  }

  get learningRate() {
    return this.material.uniforms.learningRate.value
  }

  set learningRate(value) {
    this.material.uniforms.learningRate.value = value
  }
}
