

export default {
  buffers: [], // sound buffers
  images: [], // face images
  spritemaps: [ // sprite maps
    require('../data/iwata.json').spritemap,
    require('../data/kogawa.json').spritemap,
    require('../data/matsuo.json').spritemap,
    require('../data/otabe.json').spritemap,
    require('../data/noda.json').spritemap,
  ],
  lut: null
}
