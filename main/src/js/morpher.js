import 'three'

export default class Morpher extends THREE.Mesh {
  constructor(image, points) {
    const texture = new THREE.Texture(image, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.RepeatWrapping)
    // texture.generateMipmaps = false
    texture.needsUpdate = true

    const geometry = new THREE.PlaneGeometry(1000, 500, 1, 1)
    const material = new THREE.MeshBasicMaterial({
      map: texture
    })

    super(geometry, material)
  }
}
