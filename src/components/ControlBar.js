import React from 'react'
import store from '@/store'
import { useSelector } from "react-redux"
import { imagePath } from '@/utils/MyUtils'

const ControlBar = () => {

  const camera = useSelector(state => state.camera)
  const scenes = useSelector(state => state.scenes)
  const threeDItems = useSelector(state => state.threeDItems.data)
  const setTarget = useSelector(state => state.setTarget)

  const sceneId = scenes.currentLayer == 0 ? scenes.layer0Id : scenes.layer1Id

  const setFirstScene = () => { 
    store.dispatch({
      type: 'SHOW_POPUP' ,
      mode: 'showWarning',
      data: {
        text: 'Do you want to set this scene as the first scene, and current camera angle as the default angle？',
        confirm: () => store.dispatch({
          type: 'SET_FIRST_SCENE',
          id: sceneId,
          cameraPosition: camera.position.toArray()
        }) 
      }
    })  
  }

  const goToScene = (id) => {
    store.dispatch({ type: 'CHANGE_SCENE_REQUEST', id: id })
  }

  const addScene = () => {
    store.dispatch({
      type: 'SHOW_POPUP' ,
      mode: 'uploadImage',
      data: {
        action: 'addScene', 
      }
    }) 
  }

  const removeScene = () => {
    store.dispatch({
      type: 'SHOW_POPUP' ,
      mode: 'showWarning',
      data: {
        text: 'Are you sure you want to delete this scene？',
        confirm: () => store.dispatch({ type: 'REMOVE_SCENE', id: sceneId }) 
      }
    }) 
  }

  const handleSave = () => {

    const data = {}

    if (scenes.data) {
      const scenes_ = { ...scenes.data }
      if (scenes_[scenes.firstScene?.id]) {
        scenes_[scenes.firstScene.id].isFirst = true
        scenes_[scenes.firstScene.id].cameraPosition = scenes.firstScene.cameraPosition
      }
      data.scenes = scenes_
    }

    if (threeDItems) {
      const threeDItems_ = { ...threeDItems}
      for (const id in threeDItems_) {
        if (!threeDItems_[id].rotation)
          threeDItems_[id].rotation = [0, 0, 0]
      }
      data.threeDItems = threeDItems_
    }

    // console.log(data)
    // saveToLocalText(data)
  }

  return (
    <div className={`control-bar ${setTarget.isOn ? 'is-hidden' : ''}`}>

      {
        Object.keys(scenes.data).map( 
          id => 
            <img
              key={id}
              className='control-bar-button control-bar-circle' 
              src={imagePath('icon-circle.png')}
              style={
                id == sceneId ?
                  { transform: `scale(1)` }
                :
                  { transform: `scale(0.7)`, opacity: 0.8 }
               }
              onClick={() => goToScene(id)}
            /> 
        )
      }

      <div className='control-bar-button' style={{ '--tipText': "'Set First Scene'" }} onClick={setFirstScene}>
        <img src={imagePath('icon-camera.png')} />
      </div>

      <div className='control-bar-button' style={{ '--tipText': "'Add Scene'" }} onClick={addScene}>
        <img  src={imagePath('icon-plus.png')} />
      </div>

      {sceneId != null &&
        <div className='control-bar-button' style={{ '--tipText': "'Delete Scene'", fontSize: 27 }} onClick={removeScene}>
          <img src={imagePath('icon-trash.png')} />
        </div>
      }
      
      {/* <div className='control-bar-button' style={{ '--tipText': "'Save'" }} onClick={handleSave}>
        <img src={imagePath('icon-save.png')}  />
      </div> */}

    </div>
  )
}



const saveToLocalText = ( data ) => {

  const a = document.createElement('a');
  a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent( JSON.stringify(data, null, 2) ));
  a.setAttribute('download', 'data.json');
  a.click()

}

export default ControlBar

