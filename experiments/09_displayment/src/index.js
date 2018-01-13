import dat from 'dat-gui'
import Stats from 'stats.js'
import 'three'
import DisplacementTexture from './displacement-texture'

const stats = new Stats()
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector('#main .webgl')})
const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -10, 10)
const scene = new THREE.Scene()
const displacementTexture = new DisplacementTexture(renderer)
let background = null

const setup = () => {
  const loader = new THREE.TextureLoader()
  // Make background mesh
  {
    const geometry = new THREE.PlaneGeometry(1, 1, 1, 1)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        map: {type: 't', value: loader.load('textures/debugUV.jpg')},
        remap: {type: 't', value: displacementTexture.texture},
        resolution: {type: 'v2', value: new THREE.Vector2(10, 10)},
        blurSize: {type: 'f', value: 8},
      },
      vertexShader: require('./shaders/basic-transform.vert'),
      fragmentShader: require('./shaders/composite-effect.frag'),
    })
    background = new THREE.Mesh(geometry, material)
    background.position.set(0.5, 0.5, 0)
    scene.add(background)
  }

  // Debug view 
  {
    const debugMesh = displacementTexture.createDebugMesh()
    debugMesh.scale.set(0.4, 0.2, 1)
    debugMesh.position.set(0.2, 0.1, 0)
    scene.add(debugMesh)
  }

  onResize()
  // stats
  {
    stats.domElement.style.position = 'absolute'
    stats.domElement.style.top = '0px'
    document.body.appendChild(stats.domElement)
  }
  // gui
  const gui = new dat.GUI()
  gui.add(displacementTexture, 'fadeMap', {A: 0, B: 1, C: 2})
  gui.add(displacementTexture, 'learningRate', 0.0, 1.0)

  requestAnimationFrame(update)
}

const update = (now) => {
  requestAnimationFrame(update)
  displacementTexture.render()
  renderer.render(scene, camera)
  stats.update(now)
}

const onResize = () => {
  const main = document.querySelector('#main')
  const width = main.clientWidth
  const height = main.clientHeight

  const canvas = main.querySelector('.webgl')
  canvas.width = width
  canvas.height = height

  renderer.setSize(width, height)
  camera.updateProjectionMatrix()

  background.material.uniforms.resolution.value = new THREE.Vector2(width, height)
}

setup()
window.addEventListener('resize', onResize)
window.addEventListener('mousemove', (e) => {
  const x = e.clientX / window.innerWidth
  const y = e.clientY / window.innerHeight
  displacementTexture.updatePosition(x, y)
})
