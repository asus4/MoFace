import midiManager from './midi-manager'

midiManager.on('noteon', (note, velocity) => {
  console.log('[noteon]', note, velocity)
})
midiManager.on('noteoff', (note, velocity) => {
  console.log('[noteoff]', note, velocity)
})
midiManager.on('cc', (ch, value) => {
  console.log('[cc]', ch, value)
})
midiManager.start()
