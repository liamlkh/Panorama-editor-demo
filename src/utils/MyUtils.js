export const uniqueId = () => {
  return '_' + Math.random().toString(36).substr(2, 9) +  Date.now();
}

export const imagePath = (path) => {
  return require('@/assets/media/' + path).default
}

export const PANORAMA_SIZE = 500

export const limitPosition = (position) => {
  for (let i = 0; i < 3; i ++) {
    position[i] = Math.min(PANORAMA_SIZE, Math.max(position[i], -PANORAMA_SIZE))
  }
  return position
}

export let cursorVideo = null
export const setCursorVideo = (set) => {
  return new Promise(resolve => {
    cursorVideo = document.createElement('video')
    cursorVideo.crossOrigin = "anonymous"
    cursorVideo.src = imagePath('cursor.mp4')

    cursorVideo.onloadedmetadata = () => {
      cursorVideo.autoplay = true;
      cursorVideo.loop = true
      cursorVideo.muted = true
      cursorVideo.setAttribute("muted", true)
      cursorVideo.setAttribute("playsinline", true)
      cursorVideo.play().then(
        () => {
          set()
          resolve()
        }
      )
    }
  })
}