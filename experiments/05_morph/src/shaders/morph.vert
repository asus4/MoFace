uniform sampler2D ramp;
uniform float fade;

attribute vec3 position1;
attribute vec2 uv1;
attribute float weight;

varying vec2 vUv0;
varying vec2 vUv1;
varying float vFade;

void main() {
  vUv0 = uv;
  vUv1 = uv1;
  
  // This enables morph each part individually
  // vFade = fade * weight;
  
  // Remap by ramp texture
  float ramp = texture2D(ramp, mix(uv, uv1, fade)).r; // ramp texture
  float _fade = clamp(ramp + (fade - 0.5) * 2.0, 0.0, 1.0);
  vec3 p = mix(position, position1, _fade);

  // 
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);

  vFade = _fade;
}
