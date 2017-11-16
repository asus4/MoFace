import Tone from 'tone'
import dat from 'dat-gui'

const gui = new dat.GUI()

// Routing
const micIn = new Tone.UserMedia()
const autoWah = new Tone.AutoWah()
micIn.connect(autoWah)
autoWah.toMaster()


// Make UI
const makeEffectUI = (name, effect) => {
  const folder = gui.addFolder(name)
  folder.add(effect.wet, 'value', 0.0, 1.0)
  folder.add(effect,'baseFrequency', 100, 1500)
}
makeEffectUI('wah', autoWah)

micIn.open(0).then(() => {
  console.log('start micIn')
})
