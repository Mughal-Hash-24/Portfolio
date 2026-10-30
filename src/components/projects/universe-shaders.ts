export const cosmosVertexShader = /* glsl */ `
  const float SPIN = 0.45;

  uniform float uProg;
  uniform float uTime;
  uniform float uScale;
  uniform float uSel;
  uniform float uHover;
  uniform float uTwinkle;
  uniform float uExpand;
  uniform float uRedshift;

  attribute vec3 aLocal;
  attribute vec3 aAxis;
  attribute vec3 aCenter;
  attribute vec3 aColor;
  attribute vec4 aData;

  varying vec3 vColor;
  varying float vAlpha;

  float sm(float a, float b, float x) {
    float t = clamp((x - a) / (b - a), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
  }

  vec3 rot(vec3 p, vec3 k, float a) {
    float c = cos(a);
    float s = sin(a);
    return p * c + cross(k, p) * s + k * dot(k, p) * (1.0 - c);
  }

  void main() {
    float seed = aData.x;
    float r = aData.y;
    float gid = aData.z;
    float size = aData.w;

    float expEnd = 0.16 + 0.06 * seed;
    float ex = smoothstep(0.025, expEnd, uProg);
    vec3 cloud = position * ex;

    float col = sm(0.30, 0.92, uProg);
    float variation = 0.82 + 0.12 * mod(gid, 3.0);
    float w = (SPIN / (0.4 + r)) * variation * step(0.0, gid);
    vec3 gal = aCenter * uExpand + rot(aLocal, aAxis, uTime * w);

    float swirl = col * (1.0 - col) * 4.0 * (1.0 - clamp(length(position) / 14.0, 0.0, 1.0));
    cloud = rot(cloud, vec3(0.0, 1.0, 0.0), swirl);
    vec3 p = mix(cloud, gal, col);

    vec3 c = mix(vec3(1.0, 0.96, 0.88), vec3(1.0, 0.38, 0.1), sm(0.0, 0.2, uProg));
    c = mix(c, vec3(0.35, 0.06, 0.05), sm(0.2, 0.42, uProg));
    c = mix(c, aColor, sm(0.55, 0.9, uProg));
    c = mix(c, c * vec3(1.26, 0.72, 0.54), uRedshift);

    float b = mix(1.5, 0.45, sm(0.0, 0.3, uProg));
    b = mix(b, 1.0, sm(0.6, 0.95, uProg));

    float isSel = 1.0 - step(0.5, abs(gid - uSel));
    float isHov = 1.0 - step(0.5, abs(gid - uHover));
    float dim = uSel > -5.0 ? mix(0.4, 1.0, isSel) : 1.0;
    b *= dim * (1.0 + 0.9 * isHov + 0.5 * isSel);

    float tw = 1.0 - uTwinkle * 0.5 * (0.5 + 0.5 * sin(uTime * (1.5 + seed * 5.0) + seed * 60.0));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float s = size * mix(1.8, 1.0, sm(0.0, 0.4, uProg)) * (1.0 + 0.35 * isHov);
    gl_PointSize = clamp(s * uScale / -mv.z * 1.35, 1.2, 34.0);

    vColor = c;
    vAlpha = b * tw * 0.92;
  }
`;

export const cosmosFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float f = pow(1.0 - d * 2.0, 2.0);
    gl_FragColor = vec4(vColor, f * vAlpha);
  }
`;
