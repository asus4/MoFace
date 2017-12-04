/* global THREE */
import Delaunay from 'delaunay-fast'
import 'three'


const makeBufferGeom = (points) => {
  const geometry = new THREE.BufferGeometry()

  const vertices = []
  const indices = []
  const uvs = []

  points.forEach((p) => {
    vertices.push(p[0] - 0.5, -p[1] + 0.5, 0)
  })

  const tris = Delaunay.triangulate(points)
  for (let i = 0; i < tris.length; i += 3) {
    indices.push(tris[i], tris[i + 1], tris[i + 2])

    // FIXME
    // なんかUVへんだけどよくわからん
    const p0 = points[tris[i]]
    const p1 = points[tris[i + 1]]
    const p2 = points[tris[i + 2]]
    uvs.push(
      p0[0], 1 - p0[1],
      p1[0], 1 - p1[1],
      p2[0], 1 - p2[1]
    )
  }

  geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
  geometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
  geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1))

  return geometry
}


const fromGeometry = (points) => {
  const geometry = new THREE.Geometry()
  points.forEach((p) => {
    geometry.vertices.push(new THREE.Vector3(p[0] - 0.5, -p[1] + 0.5, 0))
  })
  const tris = Delaunay.triangulate(points)
  for (let i = 0; i < tris.length; i += 3) {
    geometry.faces.push(new THREE.Face3(tris[i], tris[i + 1], tris[i + 2]))

    const p0 = points[tris[i]]
    const p1 = points[tris[i + 1]]
    const p2 = points[tris[i + 2]]
    geometry.faceVertexUvs[0].push([
      new THREE.Vector2(p0[0], 1 - p0[1]),
      new THREE.Vector2(p1[0], 1 - p1[1]),
      new THREE.Vector2(p2[0], 1 - p2[1]),
    ])
  }
  geometry.verticesNeedUpdate = true
  geometry.uvsNeedUpdate = true

  const bufferGeometry = new THREE.BufferGeometry()
  bufferGeometry.fromGeometry(geometry)
  return bufferGeometry
}


export default class Morpher extends THREE.Mesh {
  constructor(images, points) {
    // Geometory
    // const geometry = makeBufferGeom(points)
    const geometry = fromGeometry(points)

    // Material
    const texture = new THREE.Texture(images[0],
      THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping,
      THREE.NearestFilter, THREE.NearestFilter)

    texture.needsUpdate = true
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      // side: THREE.DoubleSide,
      // wireframe: true
    })

    super(geometry, material)
  }

  debug(images, points) {
    const canvas = document.querySelector('canvas')
    const WIDTH = canvas.offsetWidth
    const HEIGHT = canvas.offsetHeight
    const ctx = canvas.getContext('2d')
    const tris = Delaunay.triangulate(points)

    // tmp draw to canvas
    ctx.drawImage(images[0], 0, 0, 1024, 1024, 0, 0, WIDTH, HEIGHT)

    // Draw points
    ctx.lineWidth = 1
    ctx.strokeStyle = '#00FF00'
    ctx.beginPath()
    for (const p of points) {
      ctx.moveTo(p[0] * WIDTH, p[1] * HEIGHT)
      ctx.arc(p[0] * WIDTH, p[1] * HEIGHT, 2, 0, 2 * Math.PI)
    }
    ctx.stroke()
    ctx.strokeStyle = '#0000FF'

    // Draw triangules
    ctx.beginPath()
    let n = 0
    for (const i of tris) {
      let p = points[i]
      p = [p[0] * WIDTH, p[1] * HEIGHT]
      if (n % 3 == 0) {
        ctx.moveTo(p[0], p[1])
      } else {
        ctx.lineTo(p[0], p[1])
      }
      n++
    }
    ctx.stroke()
  }
}
