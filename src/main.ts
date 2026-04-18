import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { nodes as graphNodes, edges } from './graph'
import { findPath } from './pathfinding'
import { Raycaster, Vector2 } from 'three'

console.log("IMPORT OK", graphNodes)

const raycaster = new Raycaster()
const mouse = new Vector2()

const canvas = document.querySelector('#app') as HTMLCanvasElement

const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setClearColor(0xffffff, 1)
renderer.setSize(window.innerWidth, window.innerHeight)

const scene = new THREE.Scene()
const loader = new THREE.TextureLoader()

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(0, 200, 300)
camera.lookAt(0, 0, 0)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableRotate = true
controls.enablePan = true
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.target.set(0, 0, 0)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(100, 200, 100)
scene.add(light)

const floors: THREE.Mesh[] = []

type Node = {
  id: string
  x: number
  z: number
  floor: number
}

// クリック収集用
const collectedNodes: Node[] = []
let nodeCount = 0

// 描画用関数
function createFloor(y: number, path: string) {
  const texture = loader.load(path)

  const geometry = new THREE.PlaneGeometry(350, 150)
  const material = new THREE.MeshBasicMaterial({
  map: texture,
  side: THREE.DoubleSide
})

  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = y

  scene.add(mesh)
  floors.push(mesh)
}

function addPoint(x: number, z: number, floorY: number) {
  const geometry = new THREE.SphereGeometry(5)
  const material = new THREE.MeshBasicMaterial()
  const sphere = new THREE.Mesh(geometry, material)

  sphere.position.set(x, floorY, z)
  scene.add(sphere)
}

function drawEdge(a: Node, b: Node) {
  const points = [
    new THREE.Vector3(a.x, a.floor, a.z),
    new THREE.Vector3(b.x, b.floor, b.z)
  ]

  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial()
  const line = new THREE.Line(geometry, material)

  scene.add(line)
}

function drawPath(path: string[]) {
  const points = path.map(id => {
    const n = graphNodes[id]
    return new THREE.Vector3(n.x, n.floor, n.z)
  })

  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial()
  const line = new THREE.Line(geometry, material)

  scene.add(line)
}

// 描画ループ
function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
animate()

// ノード描画
Object.values(graphNodes).forEach(n => {
  addPoint(n.x, n.z, n.floor)
})

// エッジ描画（安全チェック付き）
edges.forEach(e => {
  const a = graphNodes[e.from]
  const b = graphNodes[e.to]

  if (!a || !b) {
    console.warn('invalid edge', e)
    return
  }

  drawEdge(a, b)
})

// 経路描画
const path = findPath("N0", "N2")
if (path) drawPath(path)

// フロア
createFloor(0, '/src/assets/floor1.png')
createFloor(50, '/src/assets/floor2.png')
createFloor(100, '/src/assets/floor3.png')
createFloor(150, '/src/assets/floor4.png')
createFloor(200, '/src/assets/floor5.png')

// クリックでノード収集
window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(floors)

  if (intersects.length > 0) {
    const point = intersects[0].point

    const node = {
      id: `N${nodeCount++}`,
      x: point.x,
      z: point.z,
      floor: point.y
    }

    collectedNodes.push(node)
    addPoint(point.x, point.z, point.y)

    console.log(node)
  }
})

// ノード出力
window.addEventListener('keydown', (e) => {
  if (e.key === 'e') {
    console.log(JSON.stringify(collectedNodes, null, 2))
  }
})