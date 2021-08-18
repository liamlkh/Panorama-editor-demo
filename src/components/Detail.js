import React from 'react'
import store from '@/store'

const Detail = ({ data }) => {

  const { id } = data
  const item = store.getState().threeDItems.data[id]

  if (item.type == 'image') return (
    <img className={`image-show ${item.images[0].width > item.images[0].height ? 'is-wide' : ''}`} src={item.images[0].url}/>
  )

  else if (item.type == 'video') return (
    <video className="video-show" autoPlay src={item.url} controls/>
  )
}

export default Detail


