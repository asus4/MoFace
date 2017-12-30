

export default {
  voices: [], // sound buffers
  faces: [], // face images
  spritemaps: [ // sprite maps
    require('../data/voicesprites/iwata.json'),
    require('../data/voicesprites/kikuchi.json'),
    require('../data/voicesprites/kiyokawa.json'),
    require('../data/voicesprites/kogawa.json'),
    require('../data/voicesprites/matsuo.json'),
    require('../data/voicesprites/nakamura.json'),
    require('../data/voicesprites/noda.json'),
    require('../data/voicesprites/onodera.json'),
    require('../data/voicesprites/otabe.json'),
    require('../data/voicesprites/takaki.json'),
  ],
  featurepoints: [ // sprite maps
    require('../data/featurepoints/iwata.json'),
    require('../data/featurepoints/kikuchi.json'),
    require('../data/featurepoints/kiyokawa.json'),
    require('../data/featurepoints/kogawa.json'),
    require('../data/featurepoints/matsuo.json'),
    require('../data/featurepoints/nakamura.json'),
    require('../data/featurepoints/noda.json'),
    require('../data/featurepoints/onodera.json'),
    require('../data/featurepoints/otabe.json'),
    require('../data/featurepoints/takaki.json'),
  ],
  textures: {
    lut: null,
    depth: null,
    morphs: []
  }
}
