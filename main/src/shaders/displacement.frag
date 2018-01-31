precision mediump float;

const float PI = 3.1415926535897932384626433832795;

uniform float learningRate;

varying vec2 vUv;

float sqrMagnitude(vec2 a, vec2 b) {
  vec2 v = vec2(a.x - b.x, a.y - b.y);
  return (v.x * v.x + v.y * v.y) * 4.0;
}

void main() {
  float d = 1.0 - sqrMagnitude(vec2(0.5, 0.5), vUv);
  gl_FragColor = vec4(
    vUv.x,
    vUv.y,
    0.5 - sin(d * PI) * 0.5,
    d * learningRate);
}
