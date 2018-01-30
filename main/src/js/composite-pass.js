import assets from './assets'

export default class CompositePass extends THREE.ShaderPass {
  constructor(remapTex) {
    const lut = new THREE.CanvasTexture(assets.textures.lut)
    lut.magFilter = lut.minFilter = THREE.NearestFilter
    lut.generateMipmaps = false
    lut.flipY = false


    super({
      uniforms: {
        tDiffuse: {type: 't', value: null},
        tLut: {type: 't', value: lut},
        blend: {type: 'f', value: 1},
        remap: {type: 't', value: remapTex},
        resolution: {type: 'v2', value: new THREE.Vector2(10, 10)},
        blurSize: {type: 'f', value: 8},
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

  get resolution() {
    return this.material.uniforms.resolution
  }

  set resolution(value) {
    this.material.uniforms.resolution.value = value
  }
}
