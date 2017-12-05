/* global THREE */
import Delaunay from 'delaunay-fast'
import 'three'


const makeBufferGeometry = (pointsArr) => {
  const tris = Delaunay.triangulate(pointsArr[0])
  const geometry = new THREE.BufferGeometry()

  pointsArr.forEach((points, i) => {
  // const points = pointsArr[0]
    const vertices = []
    const uvs = []

    tris.forEach((index) => {
      const p = points[index]
      vertices.push(p[0] - 0.5, -p[1] + 0.5, 0)
      uvs.push(p[0], 1 - p[1])
    })

    // Need position attribute at least
    const append = (i == 0) ? '' : `${i}`
    geometry.addAttribute(`position${append}`, new THREE.BufferAttribute(new Float32Array(vertices), 3))
    geometry.addAttribute(`uv${append}`, new THREE.BufferAttribute(new Float32Array(uvs), 2))
  })

  return geometry
}



export default class Morpher extends THREE.Mesh {
  constructor(images, points) {
    const geometry = makeBufferGeometry(points)
    // console.log(geometry.toJSON())

    // Material
    const textures = images.map((img) => {
      const tex = new THREE.Texture(img, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping)
      tex.needsUpdate = true
      return tex
    })
    const material = new THREE.ShaderMaterial({
      uniforms: {
        map0: {type: 't', value: textures[0]},
        map1: {type: 't', value: textures[1]},
        fade: {type: 'f', value: 0.5},
      },
      vertexShader: require('./shaders/morph.vert'),
      fragmentShader: require('./shaders/morph.frag'),
      // side: THREE.DoubleSide,
      wireframe: false
    })
    super(geometry, material)
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
}
