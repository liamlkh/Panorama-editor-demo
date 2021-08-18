import React, { useState, useEffect } from 'react';
import store from '@/store';
import { uploadFile, imagePath } from '@/utils/MyUtils'
import GreyBox from '@/components/GreyBox';

const Upload = ({ mode, data }) => {

  const { action, id } = data
  const multiple = mode == 'image' && action != 'addScene'
  const accept = mode == 'image' ? 'image/jpeg, image/png' : 'video/mp4'

  const [images, setImages] = useState([])
  const [video, setVideo] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [warning, setWarning] = useState('')

  useEffect(() => {
    if (action == 'updateItem') {
      const item = store.getState().threeDItems.data[id]
      if (item.type == 'image')
        setImages(item.images)
      else  
        setVideo(item.url)
      setTitle(item.title)
      setDescription(item.description)
      setLink(item.link)
    }
  }, [])

  useEffect(() => {
    setWarning('')
  }, [images, video])

  const removeImage = (index) => {
    setImages(images.filter( (_, index_) => index_ != index) )
  }

  const handleUploadImages = async (files, index) => {
    try {
      if (!files) return;
  
      let newImages = [];
      for (const [index, file] of Array.from(files).entries()) {
  
        if (file.type == "image/jpeg" || file.type =="image/png") {
          let image = await load(file);
          newImages = newImages.concat(
            {
              ...image,
              file
            }
          );
        }
  
        function load(file) {
          return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async function () {
              resolve( await loadImage(reader.result) );
            };
            reader.onerror = () => reject()
          })
        }
  
        function loadImage(src) {
          return new Promise((resolve, reject) => {
            let image = new Image();
            image.onload = function (){
              resolve({
                base64: src,
                width: this.width,
                height: this.height,
              });
            };
            image.onerror = () => reject()
            image.src = src;
          })
        }
        
      };
  
      if (index != undefined) {
        setImages( images.slice(0, index).concat(newImages).concat(images.slice(index, images.length)) )
      }
      else
        setImages( images.concat(newImages) )
  
    } catch (error) {
      alert(error);
      console.log("Catch Error: ", error);
    } 
  }

  const handleUploadVideo = async (files) => {
    try {
      if (!files) return;

      if (files[0].type == 'video/mp4') {
        const video = await load(files[0])
    
        function load(file) {
          return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async function () {
              resolve({ 
                file: file,
                base64: reader.result 
              })
            }
            reader.onerror = () => reject()
          })
        }

        setVideo(video);
      }
  
    } catch (error) {
      alert(error);
      console.log("Catch Error: ", error);
    } 
  }

  const confirmUploadImages = async () => {

    if (images.length == 0)
      setWarning('Please upload image first!')

    else {
      let imagesData = []
      store.dispatch({ type: 'SHOW_LOADER' })

      for (const image of images) {
        imagesData.push({
          url: image.base64,
          width: image.width,
          height: image.height
        })
      }

      switch (action) {
        case 'addImage':
          store.dispatch({
            type: 'ADD_THREE_D_ITEM',
            data: {
              type: 'image',
              scene: store.getState().scenes.currentLayer == 0 ? store.getState().scenes.layer0Id : store.getState().scenes.layer1Id,
              position: data.position,
              images: imagesData,
            }
          })
        break
        case 'updateItem':
          store.dispatch({
            type: 'UPDATE_THREE_D_ITEM',
            id: id,
            data: {
              images: imagesData,
            }
          })
        break
        case 'addScene':
          store.dispatch({
            type: 'ADD_SCENE',
            baseImage: imagesData[0].base64,
          })
        break
      }
        
      store.dispatch({ type: 'HIDE_LOADER' })
      store.dispatch({ type: 'HIDE_POPUP' }) 
    }
  }
  
  const confirmUploadVideo = async () => {

    if (video == null)
      setWarning('Please upload video first!')

    else {
      try {
        store.dispatch({ type: 'SHOW_LOADER' })
        const videoUrl = video.file ? URL.createObjectURL(video.file) : video

        switch (action) {
          case 'addVideo':
            store.dispatch({
              type: 'ADD_THREE_D_ITEM',
              data: {
                type: 'video',
                scene: store.getState().scenes.currentLayer == 0 ? store.getState().scenes.layer0Id : store.getState().scenes.layer1Id,
                position: data.position,
                url: videoUrl,
              }
            })
          break
        }

        store.dispatch({ type: 'HIDE_LOADER' })
        store.dispatch({ type: 'HIDE_POPUP' }) 
      } catch(e) {
        store.dispatch({ type: 'HIDE_LOADER' })
        store.dispatch({
          type: 'SHOW_POPUP' ,
          mode: 'showMessage',
          payload: {
            text: 'Upload Video Failed!', 
          }
        }) 
      }
    }
  }

  const handleUplaod = mode == 'image' ? handleUploadImages : handleUploadVideo  
  const confirmUpload =  mode == 'image' ? confirmUploadImages : confirmUploadVideo

  const [isDragOver, setIsDragOver] = useState(false)
  const onDrop = (e) => {
    e.preventDefault();
    handleUplaod(e.dataTransfer.files);
    setIsDragOver(false)
  }

  const onDragOver = (e) => {
    e.stopPropagation();
    e.preventDefault();
  }

  return (
    <GreyBox style={{ width: 580 }} innerStyle={{ padding: '35px 55px' }}>
      <div className="upload-container">
        
        { ( (mode == 'image' && images.length == 0) || (mode == 'video' && video == null) ) &&
          <div 
            className={`border-box center-flex column ${isDragOver ? 'is-drag-over' : ''}`}
            onDrop={onDrop} 
            onDragOver={onDragOver}
            onDragEnter={() => setIsDragOver(true)}
            onDragLeave={() => setIsDragOver(false)}
            style={{ padding: 20 }}
          >
            <img src={imagePath('icon-upload.svg')}/>
            <span style={{ fontSize: '1.8em' }}>{`Drag and drop your ${mode == 'image' ? 'image' + (multiple? 's' : '') : 'video'} here`}</span>
            <span style={{ fontSize: '0.9em', color: '#CDCDCD' }}>{`Files supported: ${mode == 'image' ? 'jpg, png' : 'mp4'}`}</span>
            <span style={{ fontSize: '0.95em' }}>or</span>
            <label className="border-box-small">
              Browse files
              <input onChange={(e) => handleUplaod(e.target.files)} type="file" id="upload-image" accept={accept} multiple={multiple}/>
            </label>
            <div className="overlay" style={{ opacity: isDragOver ? 0.6 : 0 }}/>
          </div>
        }

        {mode == 'image' && images.length > 0 &&
          <img className='scene-image-preview' src={images[0].base64}/>
        }

        {mode == 'video' && video != null &&
          <div className="video-wrapper">
            <video muted autoPlay playsInline src={video.base64 ?? (window.cdn + video)}/>
            <div className='overlay center-flex column'>
              <label
                className="border-box-small pointer" 
                style={{ margin: 10, pointerEvents: 'auto' }}
              >
                Select another video
                <input onChange={(e) => handleUplaod(e.target.files)} type="file" id="upload-image" accept={accept}/>
              </label>
            </div>
          </div>
        }

        {warning != '' &&
          <div 
            className="warning-text" 
            style={{ alignSelf: 'center', marginTop: 20 }}
          >
            {warning}
          </div>
        }

        <div 
          className="border-box-small pointer" 
          style={{ alignSelf: 'center', marginTop: 20 }}
          onClick={confirmUpload}
        >
          {action == 'updateItem' ? 'Confirm' : 'Upload'}
        </div>

      </div>

    </GreyBox>
  )

}

export default Upload




