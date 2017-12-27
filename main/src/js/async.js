// Promise function collections

/**
 * @export
 * @param {any} src 
 */
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


/**
 * @export
 * @param {File} file 
 */
export function loadFileAsync(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target.result)
    }
    reader.onerror = (err) => {
      reject(err)
    }
    reader.readAsDataURL(file)
  })
}


export function openPhotoLibrary() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.addEventListener('change', (e) => {
      const files = e.target.files
      if (files.length == 0) {
        reject('No selected file')
      } else {
        resolve(files[0])
      }
    })
    input.click()
  })
}
