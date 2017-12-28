import qs from 'querystring'

const openCenteringWindow = (href, name, width = 550, height = 420) => {
  const winHeight = screen.height
  const winWidth = screen.width
  const left = Math.round((winWidth / 2) - (width / 2))
  const top = winHeight > height ? Math.round((winHeight / 2) - (height / 2)) : 0
  const options = `scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=${width},height=${height},left=${left},top=${top}`
  window.open(href, name, options)
}

const twitter = (params) => {
  openCenteringWindow(`https://twitter.com/intent/tweet?${qs.stringify(params)}`, 'intent')
}

const facebook = (params) => {
  params.display = 'popup'
  openCenteringWindow(`https://www.facebook.com/dialog/share?${qs.stringify(params)}`, 'fbshare')
}

const line = (message) => {
  message = encodeURI(message)
  openCenteringWindow(`line://msg/text/${message}`, 'line')
  return
}

export default {
  twitter,
  facebook,
  line,
}
