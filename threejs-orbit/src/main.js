import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ROCKETS } from "./rockets.js";
import { buildRocketMesh } from "./buildRocket.js";
import { initUI, showStageInfo, hidePanel, setStageButtonLabel } from "./ui.js";

const canvas = document.getElementById("canvas");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050810);
scene.fog = new THREE.Fog(0x050810, 80, 220);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
camera.position.set(18, 12, 22);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 6;
controls.maxDistance = 80;
controls.maxPolarAngle = Math.PI * 0.92;

scene.add(new THREE.AmbientLight(0x404060, 0.6));
const sun = new THREE.DirectionalLight(0xfff5e6, 1.2);
sun.position.set(30, 50, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);
const rim = new THREE.DirectionalLight(0x5eb3ff, 0.35);
rim.position.set(-20, 10, -15);
scene.add(rim);

const pad = new THREE.Mesh(
  new THREE.CircleGeometry(12, 64),
  new THREE.MeshStandardMaterial({ color: 0x1a2030, metalness: 0.2, roughness: 0.8 })
);
pad.rotation.x = -Math.PI / 2;
pad.position.y = -0.02;
pad.receiveShadow = true;
scene.add(pad);

const stars = (() => {
  const geo = new THREE.BufferGeometry();
  const n = 1200;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 80 + Math.random() * 120;
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(p) * Math.cos(t);
    pos[i * 3 + 1] = r * Math.cos(p) * 0.4 + 20;
    pos[i * 3 + 2] = r * Math.sin(p) * Math.sin(t);
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0x99aacc, size: 0.15, sizeAttenuation: true });
  return new THREE.Points(geo, mat);
})();
scene.add(stars);

let rocketRoot = null;
let stageMeshes = [];
let rocketKey = "falcon9";
let staged = false;
let selectedMesh = null;
const highlightMat = new THREE.MeshStandardMaterial({
  color: 0xffb347,
  emissive: 0x553300,
  metalness: 0.3,
  roughness: 0.4,
});
const originalMaterials = new Map();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

function clearRocket() {
  if (rocketRoot) {
    scene.remove(rocketRoot);
    rocketRoot.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
        else o.material.dispose();
      }
    });
  }
  rocketRoot = null;
  stageMeshes = [];
  originalMaterials.clear();
  clearHighlight();
}

function restackStages() {
  let stackY = 0;
  const gap = staged ? 3.5 : 0;
  stageMeshes.forEach((group, i) => {
    const h = ROCKETS[rocketKey].stages[i].height * 0.08;
    if (staged && i > 0) stackY += gap;
    group.position.y = stackY;
    stackY += h;
  });
}

function loadRocket(key) {
  clearRocket();
  hidePanel();
  staged = false;
  setStageButtonLabel(false);

  rocketKey = key;
  const rocket = ROCKETS[key];
  const built = buildRocketMesh(rocket);
  rocketRoot = built.root;
  stageMeshes = built.stageMeshes;
  scene.add(rocketRoot);

  restackStages();
  resetCamera(built.totalHeight);
}

function resetCamera(totalHeight = 10) {
  const h = totalHeight || 10;
  camera.position.set(h * 1.4, h * 0.85, h * 1.6);
  controls.target.set(0, h * 0.45, 0);
  controls.update();
}

function clearHighlight() {
  if (!selectedMesh) return;
  selectedMesh.traverse((o) => {
    if (o.isMesh && originalMaterials.has(o)) {
      o.material = originalMaterials.get(o);
    }
  });
  selectedMesh = null;
}

function highlightStage(stageGroup) {
  clearHighlight();
  selectedMesh = stageGroup;
  stageGroup.traverse((o) => {
    if (o.isMesh) {
      originalMaterials.set(o, o.material);
      o.material = highlightMat;
    }
  });
}

function applyStaging() {
  if (!rocketRoot || stageMeshes.length < 2) return;
  staged = !staged;
  setStageButtonLabel(staged);
  restackStages();
}

function findStageGroup(obj) {
  let current = obj;
  while (current) {
    if (current.userData?.stageIndex !== undefined) return current;
    current = current.parent;
  }
  return null;
}

function onPointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObjects(stageMeshes, true);
  if (!hits.length) return;

  const stageGroup = findStageGroup(hits[0].object);
  if (!stageGroup) return;

  highlightStage(stageGroup);
  showStageInfo(rocketKey, stageGroup.userData.stageIndex);
}

canvas.addEventListener("pointerdown", onPointer);

initUI({
  onRocketChange: loadRocket,
  onStageToggle: applyStaging,
  onResetCamera: () => resetCamera(rocketRoot?.userData.totalHeight),
});

loadRocket("falcon9");

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  if (rocketRoot) rocketRoot.rotation.y += 0.0012;
  renderer.render(scene, camera);
}
animate();
