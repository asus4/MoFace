uniform sampler2D map;
uniform float learningRate;

varying vec2 vUv;

void main() {
  vec4 c0 = texture2D(map, vUv);
  c0.a = learningRate;
  vec4 c1 = vec4(vUv.x, vUv.y, 0.5, 1.0);
  gl_FragColor = mix(c0, c1, learningRate);
}
