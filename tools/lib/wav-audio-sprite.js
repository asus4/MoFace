'use strict'

const fs = require('fs')
const path = require('path')
const wav = require('node-wav')
const concatenateFloat32 = require('./concatenate-float32')

function getSilentPaddingAudio(audio, length) {
  const channels = audio.channelData.length
  const padding = {
    sampleRate: audio.sampleRate,
    bitDepth: audio.bitDepth,
    channelData: []
  }

  for (let i = 0; i < channels; i++) {
    padding.channelData[i] = new Float32Array(length)
  }

  return padding
}


function mergeAudio(audios) {
  const first = audios[0]

  const channels = first.channelData.length

  const merged = {
    channelData: []
  }

  for (let i = 0; i < channels; i++) {
    const channel = audios.map((a) => a.channelData[i])
    merged.channelData[i] = concatenateFloat32(channel)
  }

  merged.sampleRate = first.sampleRate

  return merged
}

function wavAudioSprite(files, config) {
  return new Promise((resolve, reject) => {
    const audioData = []
    const timings = {}

    let start = 0
    let channels, sampleRate

    files.forEach((file) => {
      const buffer = fs.readFileSync(file)
      const audio = wav.decode(buffer)

      channels = channels || audio.channelData.length
      sampleRate = sampleRate || audio.sampleRate

      if (audio.channelData.length !== channels) {
        return reject(`Different number of channels in wav file: ${file} has ${audio.channelData.length}, previous had ${channels}`)
      }

      if (audio.sampleRate !== sampleRate) {
        return reject(`Different sample rate in wav file: ${file} has ${audio.sampleRate}, previous had ${sampleRate}`)
      }

      const duration = audio.channelData[0].length
      const end = start + duration

      let basename = path.basename(file)
      basename = basename.replace('.wav', '')
      timings[basename] = {
        start,
        end,
        duration
      }

      const padding = Math.round(config.padding * audio.sampleRate)
      const silent = getSilentPaddingAudio(audio, padding)

      audioData.push(audio, silent)
      start = end + padding
    })

    const merged = mergeAudio(audioData)
    const encoded = wav.encode(merged.channelData, {sampleRate: merged.sampleRate})

    return resolve({
      sampleRate,
      encoded,
      timings
    })
  })
}

module.exports = wavAudioSprite
