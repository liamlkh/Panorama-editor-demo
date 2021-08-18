import React, { useEffect, useRef, useMemo } from 'react'
import store from '@/store'
import * as THREE from 'three'
import ItemShader from '@/shaders/ItemShader'

export default function Image({ meshProps, data, isHover }) {

  const materialRef = useRef()
  const { url, width, height } = data.images[0]

  useEffect(() => {
    const texture = new THREE.TextureLoader().load(url.startsWith('data') ? url: process.env.PUBLIC_URL + url)
    materialRef.current.uniforms.tex.value = texture
  }, [])
  
  const shader = useMemo(() => { return JSON.parse(JSON.stringify(ItemShader)) }, [])

  const onPointerDown = (e) => {
    if (e.which == 1) {
      store.dispatch({
        type: 'SHOW_POPUP',
        mode: 'showItem',
        data: data
      })
    }
  }

  return (
    <mesh {...meshProps} onPointerDown={onPointerDown} >
      <planeBufferGeometry args={[width, height]}/>
      <shaderMaterial ref={materialRef} args={[shader]} uniforms-isHover-value={isHover} transparent side={THREE.DoubleSide}/>
    </mesh>
  )
}

