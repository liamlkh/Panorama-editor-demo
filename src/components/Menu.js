import React, { useState, useEffect, useRef, useMemo } from 'react'
import store from '@/store'
import { useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { imagePath } from '@/utils/MyUtils'

const Option = ({ label, onClick } ) => (
  <div  
    className="option border-box-small center-flex" 
    onClick={() => {
      onClick()
    }}
  >
    {label}
  </div>
)

const Menu = () => {

  const { get, currentLayer } = useThree()

  const [position, setPosition] = useState([0, 0, 0])
  const [isShown, setIsShown] = useState(false)

  useEffect(() => {
    window.addEventListener("mousedown", onMouseDown)
    return () => window.removeEventListener("mousedown", onMouseDown)
  } ,[])

  let clickedRef = useRef(false)
  let clickLoop
  const onMouseDown = (e) => {
    if (e.which == 1 && get().hovered == null && e.target.tagName == 'CANVAS') {
      if (clickedRef.current) {
        setPosition(get().point)
        setIsShown(true)
      }
      else {
        setIsShown(false)
        clearTimeout(clickLoop)
        clickedRef.current = true
        clickLoop = setTimeout(
          () => clickedRef.current = false,
        200)
      }
    }
  }

  return (
    <mesh position={position} layers={currentLayer}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial transparent opacity={0} />
      {isShown &&
        <Html>
          <div className="menu-wrapper">
            <img 
              src={imagePath('icon-dot.svg')}
              style={{ width: 15, height: 15 }}
            />
            <div className="menu-container">
              <Option
                label='Add Image'
                onClick={() => {
                  setIsShown(false)
                  store.dispatch({
                    type: 'SHOW_POPUP' ,
                    mode: 'uploadImage',
                    data: {
                      action: 'addImage',
                      position: position,
                    }
                  }) 
                }}
              />
              <Option
                label='Add Video'
                onClick={() => {
                  setIsShown(false)
                  store.dispatch({
                    type: 'SHOW_POPUP' ,
                    mode: 'uploadVideo',
                    data: {
                      action: 'addVideo',
                      position: position,
                    }
                  }) 
                }}
              />
              <Option
                label='Link to other scene'
                onClick={() => {
                  setIsShown(false)
                  store.dispatch({
                    type: 'ADD_THREE_D_ITEM',
                    data: {
                      type: 'link',
                      scene: store.getState().scenes.currentLayer == 0 ? store.getState().scenes.layer0Id : store.getState().scenes.layer1Id,
                      position: position,
                    }
                  })
                }}
              />
            </div>
          </div>
        </Html>
      }
    </mesh>
  )
}

export default Menu