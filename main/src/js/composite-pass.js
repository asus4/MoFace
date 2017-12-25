import assets from './assets'

export default class CompositePass extends THREE.ShaderPass {
  constructor() {
    const lut = new THREE.CanvasTexture(assets.lut)
    lut.magFilter = lut.minFilter = THREE.NearestFilter
    lut.generateMipmaps = false
    lut.flipY = false


    super({
      uniforms: {
        tDiffuse: {type: 't', value: null},
        tLut: {type: 't', value: lut},
        blend: {type: 'f', value: 1},
      },
      vertexShader: require('../shaders/basic-transform.vert'),
      fragmentShader: require('../shaders/composite.frag'),
    })
  }

  set blend(value) {
    this.uniforms.blend.value = value
  }

  get blend() {
    return this.uniforms.blend.value
  }
}
