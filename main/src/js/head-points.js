import {getCurvePoints} from 'cardinal-spline-js'

const vectorExtension = (a, b, scale) => {
  const out = [0, 0]
  const indices = [0, 1]
  indices.forEach((index) => {
    // out = a - b
    out[index] = a[index] - b[index]
    // out = out * scale
    out[index] *= scale
    // out =  out + a
    out[index] += a[index]
  })
  return out
}

const flatten = (points) => {
  const arr = []
  points.forEach((p) => {
    arr.push(p[0], p[1])
  })
  return arr
}

const vflatten = (arr) => {
  const points = []
  for (let i = 0; i < arr.length; i += 2) {
    points.push([arr[i], arr[i + 1]])
  }
  return points
}

const catmullRomCurve = (points, tension, divide) => {
  return vflatten(getCurvePoints(flatten(points), tension, divide, false))
}

export default function(p) {
  // middle point of eye brows
  const top = vectorExtension(p[41], p[7], 1.2)

  const earScale = 0.18
  const earL = vectorExtension(p[2], p[41], earScale)
  const earR = vectorExtension(p[12], p[41], earScale)
  const foreheadScale = 1
  const foreheadL = vectorExtension(p[0], p[3], foreheadScale)
  const foreheadR = vectorExtension(p[14], p[11], foreheadScale)
  const points = [earL, foreheadL, top, foreheadR, earR]
  return catmullRomCurve(points, 0.5, 3)
}
