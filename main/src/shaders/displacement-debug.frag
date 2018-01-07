uniform sampler2D map;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec4 c;
  c.a = 1.0;
  if(uv.x < 0.5) {
    uv.x *= 2.0;
    c = texture2D(map, uv);
    c.b = 0.0;
  } else {
    uv.x = (uv.x-0.5) * 2.0;
    float b = texture2D(map, uv).b;
    c.rgb = vec3(b,b,b);
  }
  gl_FragColor = c;
}
