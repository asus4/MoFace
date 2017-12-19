#!/usr/bin/env node

const fs = require('fs')
const exec = require('child_process').exec
const audiosprite = require('audiosprite')
const co = require('co')

function execAsync(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error != null) {
        reject(error)
      }
      else if (stderr.trim().length > 0) {
        reject(stderr)
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
    yield execAsync(`ffmpeg -y -loglevel quiet -i ${fOut} -af silenceremove=0:0:0:-1:0.05:-45dB ${fOut}`)
    console.log(`trim: ${fOut}`)
  }

  const options = {
    output: out_path,
    export: 'wav',
    gap: 0.1
  }
  audiosprite(tmp_files, options, (err, obj) => {
    if (err) {
      console.error(err)
    }
    else {
      const result = JSON.stringify(obj, null, 2)
      fs.writeFile(`${out_path}.json`, result)
    }
  })
})
