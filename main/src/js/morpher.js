import 'three'

import assets from './assets'

const makePosUv = (points, triangles) => {
  const vertices = []
  const uvs = []
  triangles.forEach((index) => {
    const p = points[index]
    vertices.push(p[0] - 0.5, -p[1] + 0.5, 0)
    uvs.push(p[0], 1 - p[1])
  })
  return {
    vertices: new THREE.Float32BufferAttribute(vertices, 3),
    uvs: new THREE.Float32BufferAttribute(uvs, 2)
  }
}

const toTexture = (img) => {
  const tex = new THREE.Texture(img, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping)
  tex.needsUpdate = true
  return tex
}


export default class Morpher extends THREE.Mesh {
  constructor() {
    // Use Delaunay cache 
    // const tris = Delaunay.triangulate(points[0])
    const triangles = require('../data/triangles.json')
    const geometry = new THREE.BufferGeometry()
    const channels = assets.featurepoints.map((points) => {return makePosUv(points, triangles)})
    {
      geometry.addAttribute('position', channels[0].vertices)
      geometry.addAttribute('uv', channels[0].uvs)
      geometry.addAttribute('position1', channels[1].vertices)
      geometry.addAttribute('uv1', channels[1].uvs)

      // Setup
      {
        const points = require('../data/depthpoints.json')
        const attrs = makePosUv(points, triangles)
        geometry.addAttribute('weightPosition', attrs.vertices)
        geometry.addAttribute('weightUv', attrs.uvs)
      }
    }

    // Material
    const faceTexes = assets.faces.map(toTexture)
    const fadeMaps = assets.textures.morphs.map(toTexture)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        map0: {type: 't', value: faceTexes[0]},
        map1: {type: 't', value: faceTexes[1]},
        depthMap: {type: 't', value: toTexture(assets.textures.depth)},
        ramp: {type: 't', value: fadeMaps[2]},
        fade: {type: 'f', value: 0.5},
        look: {type: 'v2', value: new THREE.Vector2(0, 0)},
        parallax: {type: 'f', value: 0.05},
      },
      vertexShader: require('../shaders/morph.vert'),
      fragmentShader: require('../shaders/morph.frag'),
      // side: THREE.DoubleSide,
      wireframe: false
    })
    super(geometry, material)

    // this.weight = new Weight(geometry.getAttribute('weight'), triangles)

    this._fadeMap = 2
    this.channels = channels
    this.fadeMaps = fadeMaps
    this.faceTextures = faceTexes
  }

  get fade() {
    return this.material.uniforms.fade.value
  }

  set fade(value) {
    this.material.uniforms.fade.value = value
  }

  get wireframe() {
    return this.material.wireframe
  }

  set wireframe(value) {
    this.material.wireframe = value
  }

  get fadeMap() {
    return this._fadeMap
  }

  set fadeMap(value) {
    this._fadeMap = value
    this.material.uniforms.ramp.value = this.fadeMaps[value]
    this.fadeMaps[value].needsUpdate = true
  }

  get lookX() {return this.material.uniforms.look.value.x}
  set lookX(value) {this.material.uniforms.look.value.x = value}

  get lookY() {return this.material.uniforms.look.value.y}
  set lookY(value) {this.material.uniforms.look.value.y = value}

  get look() {return this.material.uniforms.look}

  get parallax() {return this.material.uniforms.parallax.value}
  set parallax(value) {this.material.uniforms.parallax.value = value}

  set channelA(index) {
    const channel = this.channels[index]
    if (channel) {
      this.geometry.addAttribute('position', channel.vertices)
      this.geometry.addAttribute('uv', channel.uvs)
      this.material.uniforms.map0.value = this.faceTextures[index]
    } else {
      console.warn(`chan A: ${index} not found`)
    }
  }
  set channelB(index) {
    const channel = this.channels[index]
    if (channel) {
      this.geometry.addAttribute('position1', channel.vertices)
      this.geometry.addAttribute('uv1', channel.uvs)
      this.material.uniforms.map1.value = this.faceTextures[index]
    } else {
      console.warn(`chan B: ${index} not found`)
    }
  }
}
