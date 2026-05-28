import * as THREE from "three";
import { EARTH_MESH_RADIUS, EARTH_TEXTURE_URL } from "./constants.js";
import { geodeticToThree } from "./coords.js";

export function createEarth() {
  const group = new THREE.Group();

  const geometry = new THREE.SphereGeometry(EARTH_MESH_RADIUS, 64, 48);
  const material = new THREE.MeshStandardMaterial({
    color: 0x2244aa,
    roughness: 0.85,
    metalness: 0.05,
  });

  const loader = new THREE.TextureLoader();
  loader.load(
    EARTH_TEXTURE_URL,
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      material.map = tex;
      material.color.setHex(0xffffff);
      material.needsUpdate = true;
    },
    undefined,
    () => {
      /* fallback: warna solid sudah di material */
    }
  );

  const earth = new THREE.Mesh(geometry, material);
  earth.name = "earth";
  group.add(earth);

  const atmos = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_MESH_RADIUS * 1.015, 48, 32),
    new THREE.MeshBasicMaterial({
      color: 0x5eb3ff,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    })
  );
  group.add(atmos);

  return { group, earth };
}

export function createOrbitLine() {
  const positions = new Float32Array(3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({
    color: 0x5eb3ff,
    transparent: true,
    opacity: 0.55,
  });
  const line = new THREE.Line(geometry, material);
  line.frustumCulled = false;
  return line;
}

export function updateOrbitLine(line, geodeticPoints) {
  const positions = new Float32Array(geodeticPoints.length * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < geodeticPoints.length; i++) {
    const p = geodeticPoints[i];
    geodeticToThree(p.latitude, p.longitude, p.height, v);
    positions[i * 3] = v.x;
    positions[i * 3 + 1] = v.y;
    positions[i * 3 + 2] = v.z;
  }
  line.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  line.geometry.setDrawRange(0, geodeticPoints.length);
  line.geometry.attributes.position.needsUpdate = true;
  line.geometry.computeBoundingSphere();
}

export function createIssMesh() {
  const group = new THREE.Group();
  group.name = "iss";

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.028, 0.014, 0.014),
    new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      emissive: 0x224466,
      metalness: 0.6,
      roughness: 0.35,
    })
  );
  group.add(body);

  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x1a3060,
    emissive: 0x0a1830,
    metalness: 0.4,
    roughness: 0.5,
  });
  const panelL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.004, 0.05), panelMat);
  panelL.position.x = -0.055;
  const panelR = panelL.clone();
  panelR.position.x = 0.055;
  group.add(panelL, panelR);

  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.008, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffcc66 })
  );
  group.add(marker);

  return group;
}

export function createGroundTrack() {
  const max = 256;
  const positions = new Float32Array(max * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({
    color: 0xffb347,
    transparent: true,
    opacity: 0.35,
  });
  const line = new THREE.Line(geometry, material);
  line.frustumCulled = false;
  line.userData.maxPoints = max;
  line.userData.count = 0;
  return line;
}

/** Garis tipis dari ISS ke permukaan Bumi (subsatelit). */
export function updateGroundLink(line, latRad, lonRad, heightKm) {
  const positions = new Float32Array(6);
  const iss = new THREE.Vector3();
  const ground = new THREE.Vector3();
  geodeticToThree(latRad, lonRad, heightKm, iss);
  geodeticToThree(latRad, lonRad, 0, ground);
  positions[0] = iss.x;
  positions[1] = iss.y;
  positions[2] = iss.z;
  positions[3] = ground.x;
  positions[4] = ground.y;
  positions[5] = ground.z;
  line.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  line.geometry.setDrawRange(0, 2);
}
