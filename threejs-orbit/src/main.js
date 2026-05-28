import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ROCKETS } from "./rockets.js";
import { buildRocketMesh, SCALE } from "./buildRocket.js";
import { createStageExhaust } from "./exhaust.js";
import { initUI, showStageInfo, hidePanel, setStageButtonLabel, setStageButtonDisabled } from "./ui.js";

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
scene.add(sun);
const rim = new THREE.DirectionalLight(0x5eb3ff, 0.35);
rim.position.set(-20, 10, -15);
scene.add(rim);

const pad = new THREE.Mesh(
  new THREE.CircleGeometry(14, 64),
  new THREE.MeshStandardMaterial({ color: 0x1a2030, metalness: 0.2, roughness: 0.8 })
);
pad.rotation.x = -Math.PI / 2;
pad.position.y = -0.02;
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
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x99aacc, size: 0.15 }));
})();
scene.add(stars);

let rocketRoot = null;
let stageMeshes = [];
let exhausts = [];
let rocketKey = "falcon9";
let staged = false;
let stagingAnimating = false;
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
let lastTime = performance.now();

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

function stageHeight(i) {
  return ROCKETS[rocketKey].stages[i].height * SCALE;
}

function isEngineStage(i) {
  const s = ROCKETS[rocketKey].stages[i];
  return !s.isFairing && !s.isPayload && s.engines > 0;
}

function getStackedY(index) {
  let y = 0;
  for (let i = 0; i < index; i++) y += stageHeight(i);
  return y;
}

function getStagedY(index) {
  let y = 0;
  const gap = 3.5;
  for (let i = 0; i < index; i++) {
    if (i > 0) y += gap;
    y += stageHeight(i);
  }
  return y;
}

function setExhaustActive(index, on, power = 1) {
  const ex = exhausts[index];
  if (ex) ex.setActive(on, power);
}

function setAllExhaust(off) {
  exhausts.forEach((ex, i) => {
    if (ex) ex.setActive(!off && isEngineStage(i), off ? 0 : 1);
  });
}

function disposeExhausts() {
  exhausts.forEach((ex) => ex?.dispose());
  exhausts = [];
}

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
  disposeExhausts();
  rocketRoot = null;
  stageMeshes = [];
  originalMaterials.clear();
  clearHighlight();
}

function restackStages(animatedPositions = null) {
  stageMeshes.forEach((group, i) => {
    const y = animatedPositions ? animatedPositions[i] : staged ? getStagedY(i) : getStackedY(i);
    group.position.y = y;
  });
}

function attachExhausts() {
  const rocket = ROCKETS[rocketKey];
  rocket.stages.forEach((stage, i) => {
    if (!isEngineStage(i)) {
      exhausts[i] = null;
      return;
    }
    const scale = (stage.exhaustScale || 1) * (rocket.diameter / 3.7) * 0.35;
    exhausts[i] = createStageExhaust(stageMeshes[i], scale);
  });
}

function loadRocket(key) {
  clearRocket();
  hidePanel();
  staged = false;
  stagingAnimating = false;
  setStageButtonLabel(false);
  setStageButtonDisabled(false);

  rocketKey = key;
  const built = buildRocketMesh(ROCKETS[key]);
  rocketRoot = built.root;
  stageMeshes = built.stageMeshes;
  scene.add(rocketRoot);
  rocketRoot.position.y = 0;

  attachExhausts();
  restackStages();
  setAllExhaust(false);
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
    if (o.isMesh && originalMaterials.has(o)) o.material = originalMaterials.get(o);
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

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function playStagingAnimation() {
  const engineIndices = ROCKETS[rocketKey].stages
    .map((_, i) => i)
    .filter((i) => isEngineStage(i));
  if (engineIndices.length === 0) return;

  stagingAnimating = true;
  setStageButtonDisabled(true);
  setAllExhaust(false);

  const liftMax = 2.2;
  const baseRootY = 0;

  for (let step = 0; step < engineIndices.length; step++) {
    const activeIdx = engineIndices[step];
    setAllExhaust(false);
    setExhaustActive(activeIdx, true, 1.15);

    const t0 = performance.now();
    const duration = 900;
    const startRootY = rocketRoot.position.y;
    const targetRootY = baseRootY + liftMax * ((step + 1) / engineIndices.length);

    const startYs = stageMeshes.map((g) => g.position.y);
    const endYs = stageMeshes.map((_, i) => {
      let y = 0;
      const gap = 3.5;
      for (let j = 0; j < i; j++) {
        y += stageHeight(j);
        if (j < activeIdx) y += gap;
      }
      if (i > activeIdx) y += gap * 0.6;
      return y;
    });

    await new Promise((resolve) => {
      function tick(now) {
        const t = Math.min(1, (now - t0) / duration);
        const e = easeOutCubic(t);
        rocketRoot.position.y = lerp(startRootY, targetRootY, e);
        stageMeshes.forEach((g, i) => {
          g.position.y = lerp(startYs[i], endYs[i], e);
        });
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      }
      requestAnimationFrame(tick);
    });

    if (step < engineIndices.length - 1) {
      setExhaustActive(activeIdx, true, 0.35);
      await wait(200);
    }
  }

  staged = true;
  stagingAnimating = false;
  setStageButtonLabel(true);
  setStageButtonDisabled(false);
  restackStages();

  const lastEngine = engineIndices[engineIndices.length - 1];
  setAllExhaust(false);
  setExhaustActive(lastEngine, true, 0.5);
}

async function applyStaging() {
  if (stagingAnimating || !rocketRoot || stageMeshes.length < 2) return;

  if (staged) {
    staged = false;
    rocketRoot.position.y = 0;
    restackStages();
    setAllExhaust(false);
    setStageButtonLabel(false);
    return;
  }

  await playStagingAnimation();
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
  if (stagingAnimating) return;
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

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  controls.update();
  exhausts.forEach((ex) => ex?.update(dt));
  if (rocketRoot && !stagingAnimating) rocketRoot.rotation.y += 0.0012;
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
