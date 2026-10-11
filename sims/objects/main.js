import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {runSim} from '../kit/runtime.js';
import {clamp01, easeInOutCubic, lerp} from '../kit/util.js';

// "Stille Objekte" (CompliHub360 · Stilprobe 2): ein Stillleben aus mattem
// Porzellan in Petrol und Gold — Kompass, Dokumentenstapel, Paket. Weiches
// Studiolicht, lange Schatten, eine langsame Kamerafahrt. Die Kompassnadel
// pendelt sich ein: Klarheit als Bewegung. Kein Text — Typo, Logo und Ton
// kommen in Remotion darüber (videos/styles), damit die CI an einer Stelle lebt.

const DEFAULTS = {
  duration: 7.5,
  fps: 30,
  theme: 'light',
  hud: {enabled: false, title: 'objects', subtitle: ''},
  director: {enabled: false},
  watermark: '',
};

const COL = {
  bg: '#e6eeeb', // zwischen Gradient-Mint und Papier
  porcelain: '#f5f7f6',
  petrol: '#00382f', // dunkler als Compass petrol/500: ACES-Tonemapping hellt auf, im Bild landet es bei ~#0b4d42
  gold: '#c5913b',
};

runSim(DEFAULTS, async ({cfg, canvas}) => {
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true, preserveDrawingBuffer: true});
  renderer.setPixelRatio(1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COL.bg);
  scene.fog = new THREE.Fog(COL.bg, 14, 26);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);

  scene.add(new THREE.HemisphereLight('#ffffff', '#cfdcd8', 0.9));
  const sun = new THREE.DirectionalLight('#fff3e2', 2.4);
  sun.position.set(5, 9, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.radius = 8;
  sun.shadow.bias = -0.0004;
  Object.assign(sun.shadow.camera, {left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30});
  scene.add(sun);
  const rim = new THREE.PointLight('#f4c44a', 6, 12, 2);
  rim.position.set(-4, 2.5, -3);
  scene.add(rim);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({color: '#dbe5e2', roughness: 1}),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const porcelain = new THREE.MeshPhysicalMaterial({color: COL.porcelain, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.3});
  const petrol = new THREE.MeshPhysicalMaterial({color: COL.petrol, roughness: 0.6, envMapIntensity: 0.35});
  const gold = new THREE.MeshStandardMaterial({color: COL.gold, metalness: 1, roughness: 0.32});
  const mesh = (geo, mat, parent = scene) => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };

  // Kompass
  const compass = new THREE.Group();
  compass.position.set(0.1, 0, 0.9);
  scene.add(compass);
  mesh(new THREE.CylinderGeometry(1.35, 1.42, 0.36, 96), porcelain, compass).position.y = 0.18;
  const ring = mesh(new THREE.TorusGeometry(1.3, 0.07, 24, 128), gold, compass);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.37;
  const face = mesh(new THREE.CylinderGeometry(1.18, 1.18, 0.02, 96), petrol, compass);
  face.position.y = 0.355;
  for (let i = 0; i < 4; i++) {
    const tick = mesh(new THREE.BoxGeometry(0.05, 0.02, 0.22), gold, compass);
    const a = (i * Math.PI) / 2;
    tick.position.set(Math.sin(a) * 0.98, 0.375, Math.cos(a) * 0.98);
    tick.rotation.y = a;
  }
  const needle = new THREE.Group();
  needle.position.y = 0.42;
  compass.add(needle);
  const tip = mesh(new THREE.ConeGeometry(0.11, 0.95, 4), gold, needle);
  tip.rotation.x = Math.PI / 2;
  tip.position.z = -0.47;
  const tail = mesh(new THREE.ConeGeometry(0.11, 0.75, 4), porcelain, needle);
  tail.rotation.x = -Math.PI / 2;
  tail.position.z = 0.37;
  mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 32), gold, needle);

  // Dokumentenstapel
  const docs = new THREE.Group();
  docs.position.set(-1.45, 0, -2.4);
  docs.rotation.y = 0.35;
  scene.add(docs);
  for (let i = 0; i < 5; i++) {
    const sheet = mesh(new THREE.BoxGeometry(1.7, 0.05, 2.2), porcelain, docs);
    sheet.position.y = 0.03 + i * 0.06;
    sheet.rotation.y = (i % 2 ? 1 : -1) * 0.04 * i;
  }
  const band = mesh(new THREE.BoxGeometry(1.72, 0.02, 0.12), petrol, docs);
  band.position.set(0, 0.32, -0.75);

  // Paket mit Goldband
  const parcel = new THREE.Group();
  parcel.position.set(1.55, 0, -1.6);
  parcel.rotation.y = -0.4;
  scene.add(parcel);
  mesh(new THREE.BoxGeometry(1.5, 1.05, 1.25), petrol, parcel).position.y = 0.525;
  mesh(new THREE.BoxGeometry(1.52, 1.07, 0.16), gold, parcel).position.y = 0.525;
  mesh(new THREE.BoxGeometry(0.16, 1.07, 1.27), gold, parcel).position.y = 0.525;

  const resize = () => {
    const w = canvas.clientWidth || innerWidth;
    const h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  return {
    resize,
    render(t) {
      const d = cfg.duration;
      // Kamera: langsame Bogenfahrt, leicht heran. Blickpunkt über den Objekten,
      // damit sie im unteren Bilddrittel sitzen und oben Platz für Text bleibt.
      const k = easeInOutCubic(clamp01(t / d));
      const ang = lerp(-0.42, 0.22, k);
      const rad = lerp(14.2, 12.4, k);
      camera.position.set(Math.sin(ang) * rad, lerp(9.2, 8.2, k), Math.cos(ang) * rad);
      camera.lookAt(0, 2.9, -0.8);
      // Nadel: sucht, schwingt aus, steht ab ~3,4 s ruhig.
      const s = Math.max(0, t - 0.4);
      needle.rotation.y = 0.15 + 1.6 * Math.exp(-1.05 * s) * Math.cos(3.1 * s);
      renderer.render(scene, camera);
      return {};
    },
  };
});
