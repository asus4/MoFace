
uniform sampler2D map0;
uniform sampler2D map1;
uniform float fade;

varying vec2 vUv0;
varying vec2 vUv1;

void main() {
  gl_FragColor = mix(texture2D(map0, vUv0), texture2D(map1, vUv1), fade);
}
