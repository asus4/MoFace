#pragma glslify: lookup = require(glsl-lut)

uniform sampler2D tDiffuse;
uniform sampler2D tLut;
uniform float blend;

uniform sampler2D remap;
uniform vec2 resolution;
uniform float blurSize;


varying vec2 vUv;

void main() {
  const int NUM_TAPS = 12;  
  vec2 fTaps_Poisson[NUM_TAPS];
  fTaps_Poisson[0]  = vec2(-.326,-.406);
  fTaps_Poisson[1]  = vec2(-.840,-.074);
  fTaps_Poisson[2]  = vec2(-.696, .457);
  fTaps_Poisson[3]  = vec2(-.203, .621);
  fTaps_Poisson[4]  = vec2( .962,-.195);
  fTaps_Poisson[5]  = vec2( .473,-.480);
  fTaps_Poisson[6]  = vec2( .519, .767);
  fTaps_Poisson[7]  = vec2( .185,-.893);
  fTaps_Poisson[8]  = vec2( .507, .064);
  fTaps_Poisson[9]  = vec2( .896, .412);
  fTaps_Poisson[10] = vec2(-.322,-.933);
  fTaps_Poisson[11] = vec2(-.792,-.598);
  
  vec2 sum = vec2(0., 0.);
  for (int i = 0; i < NUM_TAPS; i++) {
    // sum += texture2D(remap, (vUv + fTaps_Poisson[i] * blurSize) / resolution).xy;
    // sum += texture2D(remap, (vUv + fTaps_Poisson[i] * blurSize * 2.) / resolution).xy;
    // sum += texture2D(remap, (vUv + fTaps_Poisson[i] * blurSize * 3.) / resolution).xy;
    sum += texture2D(remap, (vUv + fTaps_Poisson[i] * blurSize / resolution)).xy;
    sum += texture2D(remap, (vUv + fTaps_Poisson[i] * blurSize * 2. / resolution)).xy;
    sum += texture2D(remap, (vUv + fTaps_Poisson[i] * blurSize * 3. / resolution)).xy;
  }
  sum /= float(NUM_TAPS * 3);
  // gl_FragColor = texture2D(map, sum);
  // vec4 c = texture2D(tDiffuse, vUv);

  vec4 c = texture2D(tDiffuse, sum);
  gl_FragColor = mix(c, lookup(c, tLut), blend);
}
