uniform float fade;

attribute vec3 position1;
attribute vec2 uv1;

varying vec2 vUv0;
varying vec2 vUv1;

void main() {
  vUv0 = uv;
  vUv1 = uv1;

  vec3 p = mix(position, position1, fade);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
