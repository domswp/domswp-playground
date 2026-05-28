import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { fetchIssNow, fetchTle } from "./api.js";
import { API_SYNC_MS, TLE_REFRESH_MS } from "./constants.js";
import {
  createEarth,
  createGroundTrack,
  createIssMesh,
  createOrbitLine,
  updateGroundLink,
  updateOrbitLine,
} from "./earth.js";
import { geodeticToThree } from "./coords.js";
import { formatUnix } from "./format.js";
import {
  getIssState,
  hasTle,
  sampleOrbitGeodetic,
  setTle,
} from "./issPropagation.js";
import {
  initUI,
  setFollowActive,
  setOrbitVisible,
  setStatus,
  updateTelemetry,
  updateTelemetryFromApi,
} from "./ui.js";

const canvas = document.getElementById("canvas");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050810);

const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 50);
camera.position.set(0, 0.4, 2.8);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 1.15;
controls.maxDistance = 8;

scene.add(new THREE.AmbientLight(0x404060, 0.55));
const sun = new THREE.DirectionalLight(0xfff5e6, 1.15);
sun.position.set(4, 2, 3);
scene.add(sun);
const rim = new THREE.DirectionalLight(0x5eb3ff, 0.25);
rim.position.set(-3, -1, -2);
scene.add(rim);

const stars = (() => {
  const geo = new THREE.BufferGeometry();
  const n = 1500;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 12 + Math.random() * 18;
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(p) * Math.cos(t);
    pos[i * 3 + 1] = r * Math.cos(p);
    pos[i * 3 + 2] = r * Math.sin(p) * Math.sin(t);
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x99aacc, size: 0.02 }));
})();
scene.add(stars);

const { group: earthGroup } = createEarth();
scene.add(earthGroup);

const orbitLine = createOrbitLine();
scene.add(orbitLine);

const groundLink = createGroundTrack();
scene.add(groundLink);

const issMesh = createIssMesh();
scene.add(issMesh);

const issPos = new THREE.Vector3();
let followIss = false;
let showOrbit = true;
let tleMeta = { tleTimestamp: null };
let clockOffsetMs = 0;

function simNow() {
  return new Date(Date.now() + clockOffsetMs);
}

function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}

function refreshOrbitLine() {
  if (!hasTle()) return;
  const points = sampleOrbitGeodetic(160, simNow());
  updateOrbitLine(orbitLine, points);
  orbitLine.visible = showOrbit;
}

async function loadTle() {
  const tle = await fetchTle();
  setTle(tle.line1, tle.line2);
  tleMeta = { tleTimestamp: tle.tleTimestamp };
  refreshOrbitLine();
  setStatus("TLE dimuat", "ok");
}

async function syncApi() {
  try {
    const api = await fetchIssNow();
    const propagated = getIssState(simNow());
    if (propagated && api.timestamp) {
      const apiDate = new Date(api.timestamp * 1000);
      const propDate = propagated.date;
      clockOffsetMs = apiDate.getTime() - propDate.getTime();
    }
    updateTelemetryFromApi(api, {
      latRad: propagated?.latitude,
      lonRad: propagated?.longitude,
      tleLabel: formatUnix(tleMeta.tleTimestamp),
    });
    setStatus("Live · API OK", "ok");
  } catch (err) {
    console.warn("API sync:", err);
    setStatus("Propagasi TLE (API gagal)", "warn");
    const propagated = getIssState(simNow());
    if (propagated) {
      updateTelemetry({
        latRad: propagated.latitude,
        lonRad: propagated.longitude,
        altKm: propagated.height,
        velocityKmS: propagated.velocityKmS,
        visibility: "—",
        apiSyncLabel: "Gagal",
        tleLabel: formatUnix(tleMeta.tleTimestamp),
        note: "Posisi 3D tetap dari TLE; coba refresh nanti.",
      });
    }
  }
}

function updateIssVisual(state) {
  geodeticToThree(state.latitude, state.longitude, state.height, issPos);
  issMesh.position.copy(issPos);

  const up = issPos.clone().normalize();
  const tangent = new THREE.Vector3(0, 1, 0).cross(up);
  if (tangent.lengthSq() < 1e-6) tangent.set(1, 0, 0);
  tangent.normalize();
  const bitangent = up.clone().cross(tangent).normalize();
  const m = new THREE.Matrix4().makeBasis(tangent, up, bitangent);
  issMesh.quaternion.setFromRotationMatrix(m);

  updateGroundLink(groundLink, state.latitude, state.longitude, state.height);
}

function updateFollowCamera() {
  if (!followIss) return;
  const offset = new THREE.Vector3(0.12, 0.06, 0.22).normalize().multiplyScalar(0.35);
  const targetCam = issPos.clone().add(offset);
  camera.position.lerp(targetCam, 0.04);
  controls.target.lerp(issPos, 0.08);
}

async function bootstrap() {
  setStatus("Memuat TLE…", "ok");
  try {
    await loadTle();
    await syncApi();
  } catch (err) {
    console.error(err);
    setStatus("Gagal memuat TLE", "err");
  }

  setInterval(syncApi, API_SYNC_MS);
  setInterval(async () => {
    try {
      await loadTle();
    } catch (e) {
      console.warn("TLE refresh:", e);
    }
  }, TLE_REFRESH_MS);
}

initUI({
  onFollowToggle: () => {
    followIss = !followIss;
    setFollowActive(followIss);
    if (!followIss) controls.enableDamping = true;
  },
  onOrbitToggle: () => {
    showOrbit = !showOrbit;
    orbitLine.visible = showOrbit;
    setOrbitVisible(showOrbit);
  },
  onResetCamera: () => {
    followIss = false;
    setFollowActive(false);
    camera.position.set(0, 0.4, 2.8);
    controls.target.set(0, 0, 0);
    controls.update();
  },
});

setOrbitVisible(true);
window.addEventListener("resize", resize);
resizeObserver?.disconnect;
const ro = new ResizeObserver(resize);
ro.observe(canvas);

function animate() {
  requestAnimationFrame(animate);
  const state = getIssState(simNow());
  if (state) updateIssVisual(state);
  updateFollowCamera();
  controls.update();
  renderer.render(scene, camera);
}

bootstrap();
animate();
