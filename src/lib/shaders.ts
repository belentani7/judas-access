/* Shaders GLSL del visor orbital — planeta neón de la Dimensión Zion. */

export const VERT_QUAD = `
attribute vec2 a_pos;
void main(){
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

export const FRAG_PLANET = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_rot;
uniform float u_zoom;

float hash2(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
float hash3(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453123); }

float noise3(vec3 p){
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f*f*(3.0-2.0*f);
  float n000 = hash3(i);
  float n100 = hash3(i+vec3(1.0,0.0,0.0));
  float n010 = hash3(i+vec3(0.0,1.0,0.0));
  float n110 = hash3(i+vec3(1.0,1.0,0.0));
  float n001 = hash3(i+vec3(0.0,0.0,1.0));
  float n101 = hash3(i+vec3(1.0,0.0,1.0));
  float n011 = hash3(i+vec3(0.0,1.0,1.0));
  float n111 = hash3(i+vec3(1.0,1.0,1.0));
  return mix(
    mix(mix(n000,n100,f.x), mix(n010,n110,f.x), f.y),
    mix(mix(n001,n101,f.x), mix(n011,n111,f.x), f.y),
    f.z
  );
}

float fbm(vec3 p){
  float v = 0.0;
  float a = 0.5;
  for(int i=0;i<5;i++){
    v += a * noise3(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

mat2 rot2(float a){
  float c = cos(a);
  float s = sin(a);
  return mat2(c,-s,s,c);
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 p = (2.0*frag - u_res)/u_res.y;
  p *= 1.42 / u_zoom;

  vec3 ro = vec3(p, 2.6);
  vec3 rd = vec3(0.0, 0.0, -1.0);

  float b = dot(ro, rd);
  float c = dot(ro, ro) - 1.0;
  float h = b*b - c;

  vec3 col = vec3(0.0);

  /* ---- fondo: nebulosa + estrellas ---- */
  float neb = fbm(vec3(p*1.35, u_time*0.012));
  col += vec3(0.10, 0.004, 0.022) * neb * 1.5;
  col += vec3(0.02, 0.0, 0.05) * fbm(vec3(p*0.7 + 9.0, u_time*0.008));

  vec2 sp2 = p * 180.0;
  vec2 cell = floor(sp2);
  float rnd = hash2(cell);
  vec2 f2 = fract(sp2) - 0.5;
  float d2 = length(f2);
  float star = smoothstep(0.28, 0.0, d2) * step(0.985, rnd);
  star *= 0.55 + 0.45*sin(u_time*2.4 + rnd*80.0);
  col += vec3(1.0, 0.9, 0.85) * star * 0.8;
  col += vec3(1.0, 0.03, 0.23) * star * step(0.85, fract(rnd*13.0)) * 1.3;
  col += vec3(0.4, 0.75, 1.0) * star * step(0.9, fract(rnd*7.0)) * 0.5;

  if(h > 0.0){
    float t = -b - sqrt(h);
    vec3 pos = ro + rd*t;
    vec3 n = normalize(pos);

    vec3 s = n;
    s.xz = rot2(u_rot.x) * s.xz;
    s.yz = rot2(u_rot.y) * s.yz;

    float lat = asin(clamp(s.y, -1.0, 1.0));
    float lon = atan(s.z, s.x);

    float cont = fbm(s*2.1 + 3.7);
    float detail = fbm(s*7.0 + u_time*0.02);
    float land = smoothstep(0.47, 0.55, cont + 0.18*detail);

    vec3 ocean = mix(vec3(0.006, 0.0, 0.028), vec3(0.03, 0.004, 0.085), detail);
    vec3 ground = mix(vec3(0.05, 0.008, 0.02), vec3(0.13, 0.02, 0.05), detail);

    float veinRaw = abs(fbm(s*5.6 + 1.3) - 0.5);
    float vein = pow(1.0 - smoothstep(0.0, 0.055, veinRaw), 3.0) * land;

    vec3 alb = mix(ocean, ground, land);
    alb += vec3(1.0, 0.03, 0.23) * vein * 1.7;

    /* ciudades neón */
    vec2 grid = vec2(lon*5.0, lat*5.0);
    vec2 gc = floor(grid);
    float gr = hash2(gc);
    vec2 gf = fract(grid) - 0.5;
    float city = step(0.84, gr) * land * smoothstep(0.28, 0.0, length(gf));
    city *= 0.45 + 0.55*sin(u_time*3.0 + gr*90.0);
    alb += vec3(1.0, 0.5, 0.12) * city * 0.9;
    alb += vec3(1.0, 0.03, 0.23) * city * step(0.6, fract(gr*5.0)) * 0.8;

    vec3 L = normalize(vec3(0.75, 0.4, 0.55));
    float diff = max(dot(n, L), 0.0);
    float view = max(dot(n, vec3(0.0, 0.0, 1.0)), 0.0);
    float rim = pow(1.0 - view, 2.6);

    col = alb * (0.15 + diff*1.2);
    col += vec3(1.0, 0.03, 0.23) * rim * 0.9;
    col += vec3(0.4, 0.0, 0.13) * pow(rim, 1.3) * 0.6;

    float cap = smoothstep(1.12, 1.4, abs(lat)*2.0);
    col = mix(col, vec3(0.55, 0.03, 0.12), cap*0.35);
  } else {
    float d = length(p);
    float ring = smoothstep(0.985, 1.0, d) * (1.0 - smoothstep(1.0, 1.3, d));
    col += vec3(1.0, 0.03, 0.23) * ring * 0.6;
    float outer = 1.0 - smoothstep(1.0, 1.95, d);
    col += vec3(0.45, 0.0, 0.1) * outer * 0.2;
  }

  vec2 vq = frag/u_res - 0.5;
  col *= 1.0 - dot(vq, vq)*0.85;
  col *= 0.965 + 0.035*sin(frag.y*2.0 + u_time*7.0);

  gl_FragColor = vec4(col, 1.0);
}
`;
