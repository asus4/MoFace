import 'three'

export default class Morpher extends THREE.Mesh {
  constructor(image, points) {
    const texture = new THREE.Texture(image, THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping)
    texture.generateMipmaps = true
    texture.needsUpdate = true

    const geometry = new THREE.PlaneGeometry(1000, 500, 1, 1)
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    })

    super(geometry, material)
  }

  get morph() {
    return this.material.opacity
  }

  set morph(value) {
    this.material.opacity = value
  }
}
