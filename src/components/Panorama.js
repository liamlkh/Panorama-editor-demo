import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

const Panorama = ({ layer, baseImage }) => {

  const materialRef = useRef()

  useEffect(() => {
    const texture = new THREE.TextureLoader().load(baseImage)
    materialRef.current.map = texture
  }, [baseImage])

  return (
    <mesh name='panorama' layers={layer} scale={[-1, 1, 1]} >
      <sphereBufferGeometry args={[800, 60, 40]} />
      <meshBasicMaterial ref={materialRef} side={THREE.BackSide}/>
    </mesh>
  )
}

export default Panorama