import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const mat = (color, roughness = .78, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness })

function makeShape(points, depth, material, bevel = .08) {
  const shape = new THREE.Shape()
  points.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y))
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: bevel, bevelThickness: bevel, curveSegments: 12 })
  geo.center()
  return new THREE.Mesh(geo, material)
}

function createMannequin(colors, garment, gender = 'male') {
  const group = new THREE.Group()
  const skin = mat('#c7b8a6', .88)
  const seam = mat('#17191f', .9)
  const shirt = mat(colors.inner)
  const jacket = mat(colors.outer, .72)
  const pants = mat(colors.pants, .86)
  const shoes = mat(colors.shoes, .58)
  const body = mat('#b8a995', .9)
  const feminine = gender === 'female'

  const add = (geo, material, x, y, z, sx=1, sy=1, sz=1, target=group) => {
    const mesh = new THREE.Mesh(geo, material)
    mesh.position.set(x,y,z); mesh.scale.set(sx,sy,sz); mesh.castShadow = true; mesh.receiveShadow = true
    target.add(mesh); return mesh
  }
  const sphere = new THREE.SphereGeometry(1, 32, 24)
  const capsule = (radius, length, material, x,y,z, rot=0) => {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 8, 16), material)
    m.position.set(x,y,z); m.rotation.z = rot; m.castShadow = true; group.add(m); return m
  }

  add(sphere, skin, 0, 3.16, 0, .34, .43, .31)
  add(new THREE.CylinderGeometry(.17,.19,.34,24), skin, 0,2.72,0)
  add(new THREE.CapsuleGeometry(feminine ? .37 : .42,.82,8,24), body, 0,2.08,0,1,feminine ? 1.02 : 1,.58)
  add(sphere, body, -.48,2.42,0,.27,.25,.28); add(sphere, body, .48,2.42,0,.27,.25,.28)
  capsule(.13,.98,body,-.62,1.75,0,-.08); capsule(.13,.98,body,.62,1.75,0,.08)
  add(sphere, skin,-.68,1.12,0,.14,.18,.14); add(sphere, skin,.68,1.12,0,.14,.18,.14)
  capsule(.205,1.12,body,-.23,.48,0,-.015); capsule(.205,1.12,body,.23,.48,0,.015)

  add(new THREE.CapsuleGeometry(.39,.68,8,24), shirt,0,2.12,.015,1,1,.66)
  const collar = new THREE.Mesh(new THREE.TorusGeometry(.19,.035,10,32), mat('#d7cbbb'))
  collar.position.set(0,2.55,.01); collar.rotation.x=Math.PI/2; group.add(collar)

  if (garment !== 'none') {
    const top = new THREE.Mesh(new THREE.CapsuleGeometry(.455,.78,8,24), jacket)
    top.position.set(0,2.08,.065); top.scale.set(1.05,1.03,.72); top.castShadow=true; group.add(top)
    if (garment === 'jacket' || garment === 'overshirt') {
      const panelL = makeShape([[-.37,2.52],[-.08,2.45],[-.14,1.62],[-.43,1.65]], .1, jacket, .025)
      panelL.position.set(-.12,0,.48); group.add(panelL)
      const panelR = makeShape([[.37,2.52],[.08,2.45],[.14,1.62],[.43,1.65]], .1, jacket, .025)
      panelR.position.set(.12,0,.48); group.add(panelR)
      const line = new THREE.Mesh(new THREE.BoxGeometry(.012,.72,.015), seam); line.position.set(0,2.08,.53); group.add(line)
    }
    capsule(.145,.94,jacket,-.65,1.77,.015,-.08)
    capsule(.145,.94,jacket,.65,1.77,.015,.08)
    if (garment === 'hoodie') {
      const hood = add(new THREE.SphereGeometry(.25,24,18), jacket,0,2.66,-.12,.95,.82,.65)
      hood.scale.z=.75
    }
  }

  add(new THREE.CylinderGeometry(feminine ? .42 : .39,.36,.25,32), pants,0,1.31,0,1,feminine ? .78 : .72, .72)
  const legGeo = new THREE.CylinderGeometry(.155,.19,1.27,24)
  add(legGeo,pants,-.225,.66,0,1,1,.92); add(legGeo,pants,.225,.66,0,1,1,.92)
  const stitchMat = mat('#ffffff',1)
  const stitch1 = new THREE.Mesh(new THREE.BoxGeometry(.009,.9,.009),stitchMat)
  stitch1.position.set(-.12,.66,.18); stitch1.material.transparent=true; stitch1.material.opacity=.13; group.add(stitch1)
  const stitch2 = stitch1.clone(); stitch2.position.x=.33; group.add(stitch2)

  const shoeGeo = new THREE.BoxGeometry(.34,.2,.62)
  add(shoeGeo,shoes,-.23,.08,.12,1,1,1.05); add(shoeGeo,shoes,.23,.08,.12,1,1,1.05)
  const soleMat=mat('#e8e6e1')
  add(new THREE.BoxGeometry(.35,.055,.64),soleMat,-.23,-.025,.13); add(new THREE.BoxGeometry(.35,.055,.64),soleMat,.23,-.025,.13)

  group.position.y=-1.72
  group.rotation.y = -.12
  return group
}

export default function Mannequin({ colors, garment, gender = 'male', onReady }) {
  const mount = useRef(null)
  const sceneRef = useRef(null)
  const modelRef = useRef(null)

  useEffect(() => {
    if (!mount.current) return
    const host = mount.current
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#11151d')
    scene.fog = new THREE.Fog('#11151d', 8, 18)
    const camera = new THREE.PerspectiveCamera(34, host.clientWidth / host.clientHeight, .1, 100)
    camera.position.set(4.8,2.6,7.8)
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
    renderer.setSize(host.clientWidth,host.clientHeight)
    renderer.shadowMap.enabled=true
    renderer.shadowMap.type=THREE.PCFSoftShadowMap
    renderer.outputColorSpace=THREE.SRGBColorSpace
    renderer.toneMapping=THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure=1.15
    host.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera,renderer.domElement)
    controls.enableDamping=true; controls.dampingFactor=.06
    controls.target.set(0,0,0); controls.minDistance=5; controls.maxDistance=11
    controls.maxPolarAngle=Math.PI*.84; controls.minPolarAngle=.25
    controls.enablePan=false

    scene.add(new THREE.HemisphereLight('#dce8ff','#3b3029',2.1))
    const key = new THREE.DirectionalLight('#fff0dc',3.2)
    key.position.set(4,7,5); key.castShadow=true; key.shadow.mapSize.set(1024,1024); scene.add(key)
    const fill = new THREE.DirectionalLight('#8db8ff',1.7); fill.position.set(-5,3,-3); scene.add(fill)
    const rim = new THREE.PointLight('#20c997',16,9); rim.position.set(0,3,-3); scene.add(rim)

    const floor = new THREE.Mesh(new THREE.CircleGeometry(3,64),mat('#1b202a'))
    floor.rotation.x=-Math.PI/2; floor.position.y=-1.74; floor.receiveShadow=true; scene.add(floor)
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3,.012,8,96),mat('#344052'))
    ring.rotation.x=Math.PI/2; ring.position.y=-1.72; ring.scale.set(1.1,1,1); scene.add(ring)

    const model=createMannequin(colors,garment,gender)
    scene.add(model); modelRef.current=model; sceneRef.current={scene,camera,renderer,controls}
    let raf
    const animate=()=>{raf=requestAnimationFrame(animate); controls.update(); renderer.render(scene,camera)}
    animate()
    const resize=()=>{if(!host.clientWidth)return; camera.aspect=host.clientWidth/host.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(host.clientWidth,host.clientHeight)}
    const observer=new ResizeObserver(resize); observer.observe(host)
    onReady?.({ reset:()=>{controls.reset();camera.position.set(4.8,2.6,7.8)}, front:()=>{camera.position.set(0,2.1,9);controls.target.set(0,0,0)}, back:()=>{camera.position.set(0,2.1,-9);controls.target.set(0,0,0)} })
    return ()=>{cancelAnimationFrame(raf);observer.disconnect();controls.dispose();renderer.dispose();host.removeChild(renderer.domElement);scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())}})}
  },[])

  useEffect(()=>{
    if(!mount.current)return
    const old=sceneRef.current
    if(!old)return
    const previous=modelRef.current
    if(previous){old.scene.remove(previous);previous.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())}})}
    const next=createMannequin(colors,garment,gender);old.scene.add(next);modelRef.current=next
  },[colors.outer,colors.inner,colors.pants,colors.shoes,garment,gender])

  return <div className="mannequin-stage" ref={mount} aria-label="عارض أزياء ثلاثي الأبعاد قابل للتدوير"><div className="stage-glow"/><div className="stage-label"><span className="live-dot"/> 3D FITTING ROOM</div><div className="stage-hint">اسحب للتدوير · قرّب بإصبعين</div></div>
}