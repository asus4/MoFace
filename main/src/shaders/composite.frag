#pragma glslify: lookup = require(glsl-lut)

uniform sampler2D tDiffuse;
uniform sampler2D tLut;
uniform float blend;

varying vec2 vUv;

void main() {
  vec4 c = texture2D(tDiffuse, vUv);
  gl_FragColor = mix(c, lookup(c, tLut), blend);
}
