import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {runSim} from '../kit/runtime.js';
import {clamp01, easeInOutCubic, lerp} from '../kit/util.js';
import TL from '../../videos/styles/combo.json';

// "Die Linie findet den Kompass" (CompliHub360 · Kombi-Probe A+B, 3D-Teil).
// Startet in exakter Draufsicht: der goldene Ring liegt pixelgenau dort, wo
// Remotion den gezeichneten Kreis endet (Mitte RING_PX, Radius RING_R px auf
// 1080×1920). Dann kippt die Kamera in die Perspektive, die Nadel sucht und
// steht, und die Kamera kehrt in die Draufsicht zurück, wo Remotion wieder
// übernimmt. Zeiten aus videos/styles/combo.json.

const DEFAULTS = {
  duration: TL.duration,
  fps: 30,
  theme: 'light',
  hud: {enabled: false, title: 'compass', subtitle: ''},
  director: {enabled: false},
  watermark: '',
};

const COL = {bg: '#e6eeeb', ground: '#dbe5e2', porcelain: '#f5f7f6', petrol: '#00382f', gold: '#c5913b'};

// Geometrie der Draufsicht (muss zu Styles.tsx · StyleCombo passen)
const FOV = 40;
const RING = 1.3; // Ring-Radius in Welt-Einheiten
const RING_Y = 0.37;
const H = 1920;
const RING_R = TL.ringR; // px
const RING_CY = TL.ringCy; // px (Bildmitte = 960)
const PPU = RING_R / RING; // Pixel pro Einheit in Ringhöhe
const CAM_H = H / (2 * PPU * Math.tan((FOV / 2) * (Math.PI / 180))); // Abstand Kamera → Ringebene
const Z_OFF = (RING_CY - H / 2) / PPU; // Ring liegt unterhalb der Bildmitte

runSim(DEFAULTS, async ({canvas}) => {
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true, preserveDrawingBuffer: true});
  renderer.setPixelRatio(1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COL.bg);
  scene.fog = new THREE.Fog(COL.bg, 16, 30);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 100);

  scene.add(new THREE.HemisphereLight('#ffffff', '#cfdcd8', 0.9));
  const sun = new THREE.DirectionalLight('#fff3e2', 2.2);
  sun.position.set(4, 10, 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.radius = 8;
  sun.shadow.bias = -0.0004;
  Object.assign(sun.shadow.camera, {left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 30});
  scene.add(sun);
  const rim = new THREE.PointLight('#f4c44a', 5, 12, 2);
  rim.position.set(-3.5, 2.2, -2.5);
  scene.add(rim);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({color: COL.ground, roughness: 1}));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const porcelain = new THREE.MeshPhysicalMaterial({color: COL.porcelain, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.3});
  const petrol = new THREE.MeshPhysicalMaterial({color: COL.petrol, roughness: 0.6, envMapIntensity: 0.35});
  const gold = new THREE.MeshStandardMaterial({color: COL.gold, metalness: 1, roughness: 0.32});
  const mesh = (geo, mat, parent) => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };

  const compass = new THREE.Group();
  scene.add(compass);
  mesh(new THREE.CylinderGeometry(1.35, 1.42, 0.36, 128), porcelain, compass).position.y = 0.18;
  const ring = mesh(new THREE.TorusGeometry(RING, 0.06, 24, 160), gold, compass);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = RING_Y;
  mesh(new THREE.CylinderGeometry(1.18, 1.18, 0.02, 128), petrol, compass).position.y = 0.355;
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

  // Zwei Posen: Draufsicht (A) und Perspektive (B); dazwischen wird interpoliert.
  // Hilfskamera statt Object3D: Kameras blicken entlang −z, Object3D.lookAt richtet +z aus.
  const pose = (pos, target, up) => {
    const o = new THREE.PerspectiveCamera();
    o.position.copy(pos);
    o.up.copy(up);
    o.lookAt(target);
    return {p: pos.clone(), q: o.quaternion.clone()};
  };
  // Draufsicht: Kamera senkrecht über dem Punkt, der in der Bildmitte liegen soll;
  // Bild-oben = −z, also liegt der Ring (z = 0) RING_CY px tief im Bild.
  const top = pose(new THREE.Vector3(0, RING_Y + CAM_H, -Z_OFF), new THREE.Vector3(0, RING_Y, -Z_OFF), new THREE.Vector3(0, 0, -1));
  const persp = (k) => {
    const ang = lerp(-0.5, 0.15, k);
    const rad = 8.6;
    return pose(new THREE.Vector3(Math.sin(ang) * rad, 5.2, Math.cos(ang) * rad), new THREE.Vector3(0, 1.15, 0), new THREE.Vector3(0, 1, 0));
  };

  const resize = () => {
    renderer.setSize(canvas.clientWidth || innerWidth, canvas.clientHeight || innerHeight, false);
    camera.aspect = (canvas.clientWidth || innerWidth) / (canvas.clientHeight || innerHeight);
    camera.updateProjectionMatrix();
  };
  resize();

  return {
    resize,
    render(t) {
      // Kamera: Draufsicht → Perspektive (tilt) → langsame Fahrt → zurück in die Draufsicht
      const drift = clamp01((t - TL.tiltEnd) / (TL.backStart - TL.tiltEnd));
      const B = persp(drift);
      const kIn = easeInOutCubic(clamp01((t - TL.tiltStart) / (TL.tiltEnd - TL.tiltStart)));
      const kOut = easeInOutCubic(clamp01((t - TL.backStart) / (TL.backEnd - TL.backStart)));
      const k = kIn * (1 - kOut);
      camera.position.lerpVectors(top.p, B.p, k);
      camera.quaternion.slerpQuaternions(top.q, B.q, k);
      // Nadel: zeigt in der Draufsicht nach Norden, sucht in der Perspektive, steht vor der Rückkehr.
      const s = Math.max(0, t - TL.needle);
      needle.rotation.y = t < TL.needle ? 0 : 1.7 * Math.exp(-1.0 * s) * Math.cos(3.0 * s);
      renderer.render(scene, camera);
      return {};
    },
  };
});
