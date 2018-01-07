#!/usr/bin/env node

/*
# Usage
./make_sprite.js result_sprite sounds/*.wav
*/

const fs = require('fs')
const exec = require('child_process').exec
// Customized version
const wavAudioSprite = require('./lib/wav-audio-sprite')
const co = require('co')


const trimDB = -30 // in decibels

function execAsync(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error != null) {
        reject(error)
      }
      else if (stderr.trim().length > 0) {
        resolve(stderr)
      }
      else {
        resolve(stdout)
      }
    })
  })
}

// Main function
co(function *() {
  const tmp_folder = 'tmp'
  const out_path = process.argv[2]
  const in_paths = process.argv.slice(3)
  const tmp_files = in_paths.map((file) => {
    return `${tmp_folder}/${file.split('/').pop()}`
  })

  // Clear temp folder
  if (fs.existsSync(tmp_folder)) {
    yield execAsync(`rm -rf ${tmp_folder}`)
  }
  fs.mkdirSync(tmp_folder)

  // Trim wav files
  for (let i = 0; i < in_paths.length; ++i) {
    const fIn = in_paths[i]
    const fOut = tmp_files[i]
    yield execAsync(`sox ${fIn} ${fOut} norm -1 channels 1`)
    yield execAsync(`ffmpeg -y -loglevel quiet -i ${fOut} -af silenceremove=0:0:0:-1:0.05:${trimDB}dB ${fOut}`)
    // console.log(`trim: ${fOut}`)
  }

  wavAudioSprite(tmp_files, {padding: 0.05})
    .then((result) => {
      // console.log(result.timings)
      const info = {}
      for (const key in result.timings) {
        const t = result.timings[key]
        info[key] = {
          start: t.start / result.sampleRate,
          end: t.end / result.sampleRate,
        }
      }
      fs.writeFileSync(`${out_path}.wav`, result.encoded)
      fs.writeFileSync(`${out_path}.json`, JSON.stringify(info, null, 2))
    })
    .catch((e) => console.error(e))
})
