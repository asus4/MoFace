#!/usr/bin/env node

/*
# Usage
./shrink_spritemap.js *.json
*/

const fs = require('fs')

const pathes = process.argv.slice(2)

for (const path of pathes) {
  console.log(path)
  const all = JSON.parse(fs.readFileSync(path, 'utf8'))
  const mini = {}

  for (const key in all.spritemap) {
    const o = all.spritemap[key]
    mini[key] = {
      start: o.start,
      end: o.end
    }
  }
  const json = JSON.stringify(mini)
  fs.writeFileSync(path, json)
}
