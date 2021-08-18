import React from 'react'
import store from '@/store'

const Detail = ({ data }) => {

  const { id } = data
  const item = store.getState().threeDItems.data[id]

  if (item.type == 'image') {
    let url = item.images[0].url
    url = url.startsWith('data') ? url : process.env.PUBLIC_URL + url
    return (
      <img className={`image-show ${item.images[0].width > item.images[0].height ? 'is-wide' : ''}`} src={url}/>
    )
  }

  else if (item.type == 'video') {
    let url = item.url
    url = url.startsWith('data') ? url : process.env.PUBLIC_URL + url
    return (
      <video className="video-show" autoPlay src={url} controls/>
    )
  }
}

export default Detail


