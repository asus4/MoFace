

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
