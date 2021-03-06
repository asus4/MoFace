/* global THREE */
import 'three'

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


class Weight {
  /**
   * Creates an instance of Weight.
   * @param {THREE.Float32BufferAttribute} attribute 
   * @param {array} triangles 
   * @memberof Weight
   */
  constructor(attribute, triangles) {
    this.attribute = attribute
    attribute.setDynamic(true)

    const FEATURES = require('./data/config.json').indexes
    const features = [
      FEATURES.outline,
      FEATURES.eyebrowL,
      FEATURES.eyebrowR,
      FEATURES.eyeR,
      FEATURES.eyeL,
      FEATURES.noseCenter,
      FEATURES.noseUnder,
      FEATURES.mouse,
    ]

    this.parameters = [
      1.0, //outline
      1.0, //eyebrowL
      1.0, //eyebrowR
      1.0, //eyeR
      1.0, //eyeL
      1.0, //noseCenter
      1.0, //noseUnder
      1.0, //mouse
      1.0, // other
    ]

    // TODO optimize
    // Find same value from features
    const getFeatureIndex = (meshIndex) => {
      let result = 8
      features.forEach((feature, featureIndex) => {
        for (const index of feature) {
          if (meshIndex === index) {
            result = featureIndex
            return
          }
        }
      })
      return result
    }

    this.references = []
    for (const index of triangles) {
      this.references.push(getFeatureIndex(index))
    }
  }

  update() {
    const array = this.attribute.array
    const length = array.length
    for (let i = 1; i < length; ++i) {
      const pIndex = this.references[i]
      if (pIndex < 0) {
        array[i] = 0
      } else {
        array[i] = this.parameters[pIndex]
      }
    }
    this.attribute.needsUpdate = true
  }

  get outline() { return this.parameters[0] }
  set outline(value) {
    this.parameters[0] = value
    this.update()
  }
  get eyebrowL() { return this.parameters[1] }
  set eyebrowL(value) {
    this.parameters[1] = value
    this.update()
  }
  get eyebrowR() { return this.parameters[2] }
  set eyebrowR(value) {
    this.parameters[2] = value
    this.update()
  }
  get eyeR() { return this.parameters[3] }
  set eyeR(value) {
    this.parameters[3] = value
    this.update()
  }
  get eyeL() { return this.parameters[4] }
  set eyeL(value) {
    this.parameters[4] = value
    this.update()
  }
  get noseCenter() { return this.parameters[5] }
  set noseCenter(value) {
    this.parameters[5] = value
    this.update()
  }
  get noseUnder() { return this.parameters[6] }
  set noseUnder(value) {
    this.parameters[6] = value
    this.update()
  }
  get mouse() { return this.parameters[7] }
  set mouse(value) {
    this.parameters[7] = value
    this.update()
  }
  get other() { return this.parameters[8] }
  set other(value) {
    this.parameters[8] = value
    this.update()
  }

  /** Make GUI for weight
   * @param {dat.GUI} gui 
   * @memberof Weight
   */
  makeGUI(gui) {
    const parameterNames = [
      false, // outline
      false, // eyebrowL
      false, // eyebrowR
      'eyeR', // eyeR
      'eyeL', // eyeL
      false, // noseCenter
      'noseUnder', // noseUnder
      'mouse', // mouse
      false, // other
    ]

    const folder = gui.addFolder('weight')
    parameterNames.forEach((name) => {
      if (name) {
        folder.add(this, name, 0.0, 1.0).onChange(() => {
          this.update()
        })
      }
    })
  }
}


export default class Morpher extends THREE.Mesh {
  constructor(images, pointsArr) {
    // Use Delaunay cache 
    // const tris = Delaunay.triangulate(points[0])
    const triangles = require('./data/indexes.json')
    const geometry = new THREE.BufferGeometry()
    {
      // Setup geometry
      pointsArr.forEach((points, i) => {
        const attrs = makePosUv(points, triangles)
        // Need position attribute at least
        const append = (i == 0) ? '' : `${i}`
        geometry.addAttribute(`position${append}`, attrs.vertices)
        geometry.addAttribute(`uv${append}`, attrs.uvs)
      })

      // Setup
      {
        const points = require('./data/depthpoints.json')
        const attrs = makePosUv(points, triangles)
        geometry.addAttribute('weightPosition', attrs.vertices)
        geometry.addAttribute('weightUv', attrs.uvs)
      }

      // weight map
      const weight = []
      triangles.forEach(() => {
        weight.push(1.0)
      })
      geometry.addAttribute('weight', new THREE.Float32BufferAttribute(weight, 1))
    }
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
        depthMap: {type: 't', value: textures[2]},
        ramp: {type: 't', value: textures[3]},
        fade: {type: 'f', value: 0.5},
        look: {type: 'v2', value: new THREE.Vector2(0, 0)},
        parallax: {type: 'f', value: 0.03},
      },
      vertexShader: require('./shaders/morph.vert'),
      fragmentShader: require('./shaders/morph.frag'),
      // side: THREE.DoubleSide,
      wireframe: false
    })
    super(geometry, material)

    this.weight = new Weight(geometry.getAttribute('weight'), triangles)

    this._fadeMap = 0
    this.fadeMaps = textures.slice(3)
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

  get parallax() {return this.material.uniforms.parallax.value}
  set parallax(value) {this.material.uniforms.parallax.value = value}
}
