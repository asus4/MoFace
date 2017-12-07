import Tone from 'tone'

export function loadImageAsync(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      resolve(image)
    }
    image.onerror = (err) => {
      reject(err)
    }
    image.src = src
  })
}

export function loadBuffer(url) {
  return new Promise((resolve, reject) => {
    const buffer = new Tone.Buffer(url,
      () => {
        resolve(buffer)
      },
      (err) => {
        console.error(err)
        reject(err)
      }
    )
  })
}
