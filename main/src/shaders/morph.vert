uniform sampler2D ramp;
uniform float fade;

uniform sampler2D depthMap;
uniform vec2 look;
uniform float parallax;

attribute vec3 position1;
attribute vec2 uv1;
attribute float weight;

attribute vec3 weightPosition;
attribute vec2 weightUv;

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
  
  // Parallax transform
  float depth = texture2D(depthMap, weightUv).r;
  p.x += depth *look.x * parallax;
  p.y += depth *look.y * parallax;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  vFade = _fade;
}
