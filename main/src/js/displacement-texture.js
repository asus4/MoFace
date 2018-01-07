import assets from './assets'

const toTexture = (img) => {
  const tex = new THREE.Texture(img, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping)
  tex.needsUpdate = true
  return tex
}

export default class DisplacementTexture extends THREE.WebGLRenderTarget {
  /**
   * Creates an instance of DisplacementTexture.
   * @param {THREE.WebGLRenderer} renderer 
   * @memberof DisplacementTexture
   */
  constructor(renderer) {
    super(512, 512, {depthBuffer: false, stencilBuffer: false})

    this.prev = new THREE.WebGLRenderTarget(512, 512, {depthBuffer: false, stencilBuffer: false})

    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(0, 1, 1, 0, -10, 10)
    this.renderer = renderer

    this._fadeMap = 2
    this.fadeMaps = assets.textures.morphs.map(toTexture)

    const geometry = new THREE.PlaneGeometry(1, 1, 1, 1)
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        map: {type: 't', value: this.fadeMaps[this._fadeMap]},
        // map: {type: 't', value: this.prev.texture},
      },
      vertexShader: require('../shaders/basic-transform.vert'),
      fragmentShader: require('../shaders/displacement.frag'),
      transparent: true,
    })
    const background = new THREE.Mesh(geometry, this.material)
    background.position.set(0.5, 0.5, 0)
    this.scene.add(background)
    //

    // circle
    // this.circle = new THREE.Mesh(geometry,
    //   new THREE.MeshBasicMaterial({
    //     map: toTexture(assets.textures.circle),
    //     transparent: true,
    //   })
    // )
    // this.circle.position.set(0.5, 0.5, 1.0)
    // this.scene.add(this.circle)
  }

  setPosition(x, y) {
    // this.circle.position.set(x, y, 0)
  }

  render() {
    this.render.autoClear = false
    this.renderer.render(this.scene, this.camera, this, true)
    this.render.autoClear = true
  }

  createDebugMesh() {
    const geometry = new THREE.PlaneGeometry(1, 1, 1, 1)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        map: {tyep: 't', value: this.texture},
      },
      vertexShader: require('../shaders/basic-transform.vert'),
      fragmentShader: require('../shaders/displacement-debug.frag'),
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(0, 0, 1)
    mesh.scale.set(200, 100, 1)
    return mesh
  }

  get fadeMap() {
    return this._fadeMap
  }

  set fadeMap(value) {
    this._fadeMap = value
    this.material.uniforms.map.value = this.fadeMaps[value]
    this.fadeMaps[value].needsUpdate = true
  }
}
