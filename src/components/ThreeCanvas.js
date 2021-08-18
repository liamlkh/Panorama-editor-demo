import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import * as THREE from 'three'
import store from '@/store'
import { useSelector } from "react-redux"
import { Canvas, useThree } from '@react-three/fiber'
import { useProgress, OrbitControls } from '@react-three/drei'
import { ResizeObserver } from '@juggle/resize-observer'
import { isMobile } from 'react-device-detect' 

import Panorama from '@/components/Panorama'
import Menu from '@/components/Menu'
import ThreeDItem from '@/components/ThreeDItem'
import Effects from '@/components/Effects'

const ThreeLoader = () => {
  const [isInited, setIsInited] = useState(false)
  const scenes = useSelector(state => state.scenes)
  const { active } = useProgress()

  let timeoutRef = useRef(null)

  // init
  useEffect(() => {
    if (!active && !isInited) {

      if (timeoutRef.current != null) 
        clearTimeout(timeoutRef.current)

      timeoutRef.current = setTimeout(
        () => {
          document.getElementById("root").classList.remove("not-ready");
          setIsInited(true)
        }
      ,700)

    }
  }, [active])

  // change scenes
  useEffect(() => {
    if (!active && scenes.isTransitionRequested && !scenes.isTransitioning) {

      if (timeoutRef.current != null) 
        clearTimeout(timeoutRef.current)

      timeoutRef.current = setTimeout(
        () => store.dispatch({ type: 'CHANGE_SCENE_START' })
      ,500)

    }
  }, [active, scenes])
  
  return null
}

const Setup = ({ setEnableRotate }) => {

  const canvas = document.getElementById('canvas-container')
  const { camera, raycaster, scene, set, get } = useThree()

  const mouse = new THREE.Vector2()
  const myRaycaster = new THREE.Raycaster()

  useEffect(() => {
    store.dispatch({ type: 'SET_CAMERA', camera: camera })

    camera.layers.enable(0)
    camera.layers.enable(1)
    raycaster.layers.enable(0)
    raycaster.layers.enable(1)

    canvas.addEventListener("mousemove", onMouseMove)
    canvas.addEventListener("wheel", onWheel)
    if (isMobile) {
      canvas.addEventListener("touchmove", onTouchMove)
      canvas.addEventListener("touchend", onTouchEnd)
    }
    return () => {
      canvas.removeEventListener("mousemove", onMouseMove)
      canvas.removeEventListener("wheel", onWheel)
      if (isMobile) {
        canvas.removeEventListener("touchmove", onTouchMove)
        canvas.removeEventListener("touchend", onTouchEnd)
      }
    }
  }, [camera.layers, raycaster.layers])

  const onMouseMove = useCallback(e => {
    if (!get().isTransitioning && !store.getState().popup.isShown) {
      
      mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1
      mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1

      myRaycaster.setFromCamera(mouse, camera)
      myRaycaster.layers.set(get().currentLayer)
      const intersects = myRaycaster.intersectObjects(scene.children)
      for (const intersect of intersects) {
        if (intersect.object.name == 'threeDItem') {
          set({ hovered: intersect.object.uid })
          document.getElementById("root").style.cursor = "pointer"
          return
        }
        if (intersect.object.name == 'panorama') {
          set({ point: intersect.point})
        }
      }

      document.getElementById("root").style.cursor = "unset"
      set({ hovered: null })
    }
  }, [])

  const onWheel = useCallback(({ deltaY }) => {
    camera.fov = Math.max(23, Math.min(camera.fov + deltaY * 0.005, 100))
    camera.updateProjectionMatrix()
  }, [])

  // touch events on mobile
  const deltaStart = useRef(null)
  const fovStart = useRef(null)
  const onTouchMove = useCallback(e => {
    if (e.touches.length > 1) {
      setEnableRotate(false)
      const point0 = new THREE.Vector2(e.touches[0].clientX, e.touches[0].clientY)
      const point1 = new THREE.Vector2(e.touches[1].clientX, e.touches[1].clientY)
      const delta = point0.distanceTo(point1)
      if (deltaStart.current == null) {
        deltaStart.current = delta
        fovStart.current = camera.fov
      }
      else {
        camera.fov = Math.max(23, Math.min(fovStart.current * deltaStart.current / delta, 100))
        camera.updateProjectionMatrix()
      }
    }
  }, [])

  const onTouchEnd = useCallback(e => {
    setEnableRotate(true)
    deltaStart.current = null
    fovStart.current = null
  }, [])

  return null
}

const Scene = ({ layer, baseImage, items }) => {
  return (
    <>
      <Suspense fallback={null}>
        <Panorama layer={layer} baseImage={baseImage} />
      </Suspense>
      {items.map(item => 
        <Suspense key={item.id} fallback={null}>
          <ThreeDItem id={item.id} type={item.type} layer={layer} data={item} /> 
        </Suspense>
      )}
    </>
  )
}

export default function ThreeCanvas() {

  const scenes = useSelector(state => state.scenes)
  const threeDItems = useSelector(state => state.threeDItems.data)
  const isSetTargetOn = useSelector(state => state.setTarget.isOn)
  const controlsRef = useRef()

  const [enableRotate, setEnableRotate] = useState(true)

  return (
    <div id="canvas-container">
      <ThreeLoader/>      
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 0.1], fov: 55 }}
        resize={{ polyfill: ResizeObserver }}
      >
        <Setup setEnableRotate={setEnableRotate} />
        {scenes.layer0Id != null && 
          <Scene 
            id={scenes.layer0Id} 
            layer={0} 
            baseImage={scenes.data[scenes.layer0Id].baseImage}
            items={Object.entries(threeDItems).map(([id, data]) => ({ id, ...data })).filter(x => x.scene == scenes.layer0Id)} 
          />
        }
        {scenes.layer1Id != null && 
          <Scene 
            id={scenes.layer1Id} 
            layer={1} 
            baseImage={scenes.data[scenes.layer1Id].baseImage}
            items={Object.entries(threeDItems).map(([id, data]) => ({ id, ...data })).filter(x => x.scene == scenes.layer1Id)} 
          />
        }
        <Effects scenes={scenes} controlsRef={controlsRef} />
        {!scenes.isTransitioning && !isSetTargetOn && <Menu/>}
        <OrbitControls ref={controlsRef} enableRotate={enableRotate && !scenes.isTransitioning} enableZoom={false} enablePan={false} enableDamping dampingFactor={0.2} autoRotate={false} rotateSpeed={-0.2} /> 
      </Canvas>
    </div>
  )
}
