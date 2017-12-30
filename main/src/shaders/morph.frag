
uniform sampler2D map0;
uniform sampler2D map1;
uniform sampler2D ramp;
uniform float fade;

varying vec2 vUv0;
varying vec2 vUv1;
varying float vFade;

void main() {
  gl_FragColor = mix(texture2D(map0, vUv0), texture2D(map1, vUv1), vFade);
  // gl_FragColor = vec4(vFade,vFade,vFade,1.0); // Debug ramp texture
}
