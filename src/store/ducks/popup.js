import { createReducer, createActions } from 'reduxsauce'

/* Types & Action Creators */

const { Types, Creators } = createActions({
  showPopup: ['data'],
  hidePopup: ['baseImage'],
})

export const PopupTypes = Types
export default Creators

/* Initial State */

export const INITIAL_STATE = {
  isShown: false,
}

/* Reducers */

const showPopup = ( state, { mode, data } ) => {
  return {
    isShown: true,
    mode: mode,
    data: data
  }
}

const hidePopup = ( state ) => {
  return {
   isShown: false
  }
}

/* Reducers to types */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.SHOW_POPUP]: showPopup,
  [Types.HIDE_POPUP]: hidePopup,
})