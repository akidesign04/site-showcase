/* =========================================================
   webgl.js — NOCTURNE v2
   High-fidelity 3D carousel + post-processing
   ========================================================= */

const canvas = document.getElementById('gl-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x050507, 1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  46,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 1.8, 6.2);
camera.lookAt(0, -0.2, -2);

/* ===== Slide data: Five Acts of Night ===== */
const SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=85&auto=format',
    roman: 'I',
    number: '01',
    title: 'AZURE',
    chapter: 'The Morning Square',
    sub: 'A coat in the color of open sky.',
    fabric: 'Cotton twill · Gabardine · Silk',
    looks: 12,
    label: 'OPENING',
    tint: [0.60, 0.72, 0.88],    /* soft sky blue */
    warmth: -0.05
  },
  {
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=85&auto=format',
    roman: 'II',
    number: '02',
    title: 'ATELIER',
    chapter: 'The Quiet Rail',
    sub: 'Where every garment waits its turn.',
    fabric: 'Wool blend · Cotton · Linen',
    looks: 14,
    label: 'STUDIO',
    tint: [0.82, 0.78, 0.72],    /* warm neutral */
    warmth: 0.04
  },
  {
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=85&auto=format',
    roman: 'III',
    number: '03',
    title: 'SOLAR',
    chapter: 'The Court of Light',
    sub: 'Sportswear caught in full daylight.',
    fabric: 'Tech jersey · Cotton fleece · Nylon',
    looks: 10,
    label: 'MOTION',
    tint: [0.92, 0.82, 0.56],    /* noon gold */
    warmth: 0.16
  },
  {
    url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&q=85&auto=format',
    roman: 'IV',
    number: '04',
    title: 'PRISM',
    chapter: 'The Spectrum Day',
    sub: 'Color, sun, and small joys.',
    fabric: 'Cotton poplin · Silk scarf · Acetate',
    looks: 9,
    label: 'BLOOM',
    tint: [0.88, 0.72, 0.78],    /* playful pop */
    warmth: 0.10
  },
  {
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=85&auto=format',
    roman: 'V',
    number: '05',
    title: 'CARMINE',
    chapter: 'The Avenue Walk',
    sub: 'An afternoon dressed in deep red.',
    fabric: 'Boiled wool · Leather · Cashmere',
    looks: 13,
    label: 'FINALE',
    tint: [0.78, 0.50, 0.52],    /* wine red */
    warmth: 0.12
  }
];

/* ===== Curved shader with color grading ===== */
const curveVertexShader = `
  uniform float uCurve;
  uniform float uBend;
  uniform float uTime;
  uniform float uActive;
  varying vec2 vUv;
  varying float vDist;

  void main() {
    vUv = uv;
    vec3 pos = position;

    /* Cylindrical curve */
    float curve = pos.x * pos.x * uCurve;
    pos.z -= curve;
    pos.y += pos.x * uBend;

    /* Subtle breathing on the active slide */
    float breath = sin(uTime * 0.8) * 0.008 * uActive;
    pos.z += breath;

    vec4 world = modelMatrix * vec4(pos, 1.0);
    vDist = length(world.xyz - cameraPosition);

    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const curveFragmentShader = `
  uniform sampler2D uTexture;
  uniform float uAlpha;
  uniform float uGray;
  uniform vec3  uTint;
  uniform float uWarmth;
  uniform float uActive;
  uniform float uTime;
  varying vec2 vUv;
  varying float vDist;

  vec3 lift(vec3 c, float a) {
    return clamp(c + a, 0.0, 1.0);
  }

  void main() {
    vec2 uv = vUv;

    /* Subtle parallax sway on active slide */
    uv.y += sin(uv.x * 3.0 + uTime * 0.3) * 0.002 * uActive;

    vec4 tex = texture2D(uTexture, uv);

    /* Baseline desaturation for editorial mood */
    float luma = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    vec3 gray = vec3(luma);
    vec3 col = mix(tex.rgb, gray, 0.35 + uGray * 0.65);

    /* Warmth (golden tint on highlights, cool on shadows) */
    vec3 warm = vec3(1.04, 0.96, 0.86);
    vec3 cool = vec3(0.88, 0.94, 1.06);
    col *= mix(cool, warm, 0.5 + uWarmth * 2.0);

    /* Tint blending — stronger multiplication for cohesion */
    col = mix(col, col * uTint * 1.35, 0.78);

    /* Contrast + lift blacks + slight darken */
    col = (col - 0.5) * 1.18 + 0.5;
    col *= 0.88;
    col = lift(col, 0.015);

    /* Edge fade (cleaner border) */
    float edge = smoothstep(0.0, 0.012, vUv.x) * smoothstep(1.0, 0.988, vUv.x);
    edge *= smoothstep(0.0, 0.012, vUv.y) * smoothstep(1.0, 0.988, vUv.y);

    /* Slight fog-by-distance */
    float fog = 1.0 - smoothstep(5.0, 14.0, vDist);

    /* Film grain on texture (very subtle) */
    float grain = fract(sin(dot(uv * uTime * 0.001, vec2(12.9898, 78.233))) * 43758.5453);
    col += (grain - 0.5) * 0.012;

    gl_FragColor = vec4(col, uAlpha * edge * fog);
  }
`;

function createCurvedMesh(texture, slide) {
  const geo = new THREE.PlaneGeometry(3.8, 5.1, 30, 30);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture },
      uCurve:   { value: 0.17 },
      uBend:    { value: 0.0 },
      uAlpha:   { value: 1.0 },
      uGray:    { value: 0.0 },
      uTint:    { value: new THREE.Vector3(slide.tint[0], slide.tint[1], slide.tint[2]) },
      uWarmth:  { value: slide.warmth },
      uActive:  { value: 1.0 },
      uTime:    { value: 0.0 }
    },
    vertexShader: curveVertexShader,
    fragmentShader: curveFragmentShader,
    transparent: true,
    side: THREE.DoubleSide
  });
  return new THREE.Mesh(geo, mat);
}

/* ===== Texture loading ===== */
const loader = new THREE.TextureLoader();
loader.crossOrigin = 'anonymous';

const meshes = [];
let totalLoaded = 0;

window.loadProgress = 0;

SLIDES.forEach((slide, i) => {
  loader.load(
    slide.url,
    function (tex) {
      tex.minFilter = THREE.LinearFilter;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const mesh = createCurvedMesh(tex, slide);
      mesh.userData.index = i;
      mesh.userData.slide = slide;
      scene.add(mesh);
      meshes[i] = mesh;
      totalLoaded++;
      window.loadProgress = (totalLoaded / SLIDES.length) * 100;
      if (totalLoaded === SLIDES.length) {
        setTimeout(function () {
          window.carouselReady && window.carouselReady();
        }, 120);
      }
    },
    undefined,
    function () {
      /* Fallback: count as loaded to avoid stalling */
      totalLoaded++;
      window.loadProgress = (totalLoaded / SLIDES.length) * 100;
      if (totalLoaded === SLIDES.length) {
        setTimeout(function () {
          window.carouselReady && window.carouselReady();
        }, 120);
      }
    }
  );
});

/* ===== Ambient particles (layered dust + embers) ===== */
const particleCount = 120;
const particleGeo = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleSizes = new Float32Array(particleCount);
const particleVelocities = [];

for (let pi = 0; pi < particleCount; pi++) {
  particlePositions[pi * 3]     = (Math.random() - 0.5) * 22;
  particlePositions[pi * 3 + 1] = (Math.random() - 0.5) * 14;
  particlePositions[pi * 3 + 2] = (Math.random() - 0.5) * 10 - 3;
  particleSizes[pi] = Math.random() * 0.025 + 0.006;
  particleVelocities.push({
    x: (Math.random() - 0.5) * 0.0025,
    y: (Math.random() - 0.5) * 0.0012 + 0.0008,
    z: (Math.random() - 0.5) * 0.0012,
    seed: Math.random() * Math.PI * 2
  });
}

particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particleGeo.setAttribute('aSize', new THREE.BufferAttribute(particleSizes, 1));

const particleMat = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0.0 },
    uPixelRatio: { value: renderer.getPixelRatio() }
  },
  vertexShader: `
    uniform float uTime;
    uniform float uPixelRatio;
    attribute float aSize;
    varying float vAlpha;
    void main() {
      vec3 p = position;
      p.x += sin(uTime * 0.3 + p.y * 0.5) * 0.05;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = aSize * 300.0 * uPixelRatio / max(-mv.z, 0.001);
      vAlpha = 0.35 + sin(uTime * 0.9 + p.y * 2.0) * 0.25;
    }
  `,
  fragmentShader: `
    varying float vAlpha;
    void main() {
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      float a = smoothstep(0.5, 0.0, d);
      gl_FragColor = vec4(vec3(0.95, 0.92, 0.84), a * vAlpha * 0.75);
    }
  `,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const particleSystem = new THREE.Points(particleGeo, particleMat);
scene.add(particleSystem);

/* ===== Post-processing: ripple distortion + chromatic aberration ===== */
const rtScene = new THREE.WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight,
  { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }
);

const distortVert = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
`;

const distortFrag = `
  uniform sampler2D uScene;
  uniform vec2  uMouse;
  uniform float uTime;
  uniform float uStrength;
  uniform float uAberration;
  uniform vec2  uResolution;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec2 diff = uv - uMouse;
    float dist = length(diff);
    float ripple = sin(dist * 32.0 - uTime * 5.0) * uStrength;
    float falloff = smoothstep(0.42, 0.0, dist);
    vec2 offset = normalize(diff + 0.0001) * ripple * falloff * 0.018;

    /* Chromatic aberration near the ripple */
    float ab = uAberration * falloff * 0.003 + 0.0008;
    float r = texture2D(uScene, uv + offset + vec2(ab, 0.0)).r;
    float g = texture2D(uScene, uv + offset).g;
    float b = texture2D(uScene, uv + offset - vec2(ab, 0.0)).b;

    /* Subtle vignette re-reinforcement */
    vec2 center = uv - 0.5;
    float vign = 1.0 - dot(center, center) * 0.55;

    gl_FragColor = vec4(vec3(r, g, b) * vign, 1.0);
  }
`;

const postUniforms = {
  uScene:      { value: rtScene.texture },
  uMouse:      { value: new THREE.Vector2(0.5, 0.5) },
  uTime:       { value: 0.0 },
  uStrength:   { value: 0.0 },
  uAberration: { value: 0.0 },
  uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
};

const postGeo = new THREE.PlaneGeometry(2, 2);
const postMat = new THREE.ShaderMaterial({
  uniforms: postUniforms,
  vertexShader: distortVert,
  fragmentShader: distortFrag,
  transparent: false
});
const postMesh = new THREE.Mesh(postGeo, postMat);
const postScene  = new THREE.Scene();
const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
postScene.add(postMesh);

/* Mouse tracking */
let targetStrength = 0;
let lastMx = 0, lastMy = 0;
let cameraTargetX = 0;
let cameraTargetY = 1.8;

window.addEventListener('mousemove', function (e) {
  const nx = e.clientX / window.innerWidth;
  const ny = 1.0 - e.clientY / window.innerHeight;
  postUniforms.uMouse.value.set(nx, ny);

  const dx = e.clientX - lastMx;
  const dy = e.clientY - lastMy;
  const speed = Math.sqrt(dx * dx + dy * dy);
  targetStrength = Math.min(targetStrength + speed * 0.004, 1.0);
  lastMx = e.clientX;
  lastMy = e.clientY;

  /* Camera subtle parallax */
  const cx = (e.clientX / window.innerWidth - 0.5) * 0.25;
  const cy = 1.8 + (e.clientY / window.innerHeight - 0.5) * 0.18;
  cameraTargetX = cx;
  cameraTargetY = cy;
});

/* ===== Animation loop ===== */
function animate() {
  requestAnimationFrame(animate);

  const t = performance.now() * 0.001;
  postUniforms.uTime.value = t;
  particleMat.uniforms.uTime.value = t;

  targetStrength *= 0.96;
  postUniforms.uStrength.value +=
    (targetStrength - postUniforms.uStrength.value) * 0.09;
  postUniforms.uAberration.value +=
    (targetStrength - postUniforms.uAberration.value) * 0.05;

  /* Camera easing */
  camera.position.x += (cameraTargetX - camera.position.x) * 0.04;
  camera.position.y += (cameraTargetY - camera.position.y) * 0.04;
  camera.lookAt(0, -0.2, -2);

  /* Animate slide breathing */
  meshes.forEach(function (mesh) {
    if (!mesh) return;
    mesh.material.uniforms.uTime.value = t;
  });

  /* Update particles */
  const posArr = particleSystem.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    posArr[i * 3]     += particleVelocities[i].x;
    posArr[i * 3 + 1] += particleVelocities[i].y;
    posArr[i * 3 + 2] += particleVelocities[i].z;
    if (posArr[i * 3 + 1] > 7)  posArr[i * 3 + 1] = -7;
    if (posArr[i * 3]     > 11) posArr[i * 3]     = -11;
    if (posArr[i * 3]     < -11) posArr[i * 3]    = 11;
  }
  particleSystem.geometry.attributes.position.needsUpdate = true;

  /* Render main scene to RT */
  renderer.setRenderTarget(rtScene);
  renderer.render(scene, camera);

  /* Render distortion to screen */
  renderer.setRenderTarget(null);
  renderer.render(postScene, postCamera);
}
animate();

/* ===== Resize ===== */
window.addEventListener('resize', function () {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  rtScene.setSize(w, h);
  postUniforms.uResolution.value.set(w, h);
});

/* ===== Public API ===== */
window.NocturneGL = {
  scene: scene,
  camera: camera,
  renderer: renderer,
  meshes: meshes,
  SLIDES: SLIDES,
  postUniforms: postUniforms
};

console.log('✅ webgl.js loaded');
