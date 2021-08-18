import React, { useEffect } from 'react'
import { Provider, useSelector } from 'react-redux'
import store from './store'

import '@/styles/styles.css'

import ThreeCanvas from '@/components/ThreeCanvas'
import Popup from '@/components/Popup'
import Loader from '@/components/Loader'
import ControlBar from '@/components/ControlBar'
import SetTarget from '@/components/SetTarget'

const App = () => {

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/data.json")
    .then(res => res.json())
    .then(data => {
       store.dispatch({ type: 'INIT_SCENES', data: data?.scenes ?? {} })
      if (data?.threeDItems) {
        store.dispatch({ type: 'INIT_THREE_D_ITEMS', data: data.threeDItems })
      }
    })
  }, [])

  return (
    <Provider store={store}>
      <Components/>
    </Provider>
  )
}

const Components = () => {

  const config = useSelector(state => state.config)

  return (
    <>
      <ThreeCanvas/>
      <Popup/>
      <ControlBar/>
      <Loader/>
      <SetTarget/>
    </>
  )
}

export default App
