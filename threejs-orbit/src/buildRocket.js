import * as THREE from "three";

const SCALE = 0.08;

function cylinder(radius, height, color, yCenter) {
  const geo = new THREE.CylinderGeometry(radius, height > 0 ? radius * 0.98 : radius, height, 32);
  const mat = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.35,
    roughness: 0.45,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = yCenter;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cone(radius, height, color, yCenter) {
  const geo = new THREE.ConeGeometry(radius, height, 32);
  const mat = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.4,
    roughness: 0.4,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = yCenter;
  mesh.castShadow = true;
  return mesh;
}

function engineBell(radius, y) {
  const geo = new THREE.CylinderGeometry(radius * 0.35, radius, radius * 0.9, 24);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    metalness: 0.6,
    roughness: 0.35,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = y;
  return mesh;
}

function addEngines(stageGroup, r, engineCount, engineY) {
  const bells = engineCount > 1 ? Math.min(engineCount, 9) : 1;
  if (bells === 1) {
    stageGroup.add(engineBell(r, engineY));
    return;
  }
  const ringR = r * (engineCount === 5 ? 0.5 : 0.55);
  for (let i = 0; i < bells; i++) {
    const a = (i / bells) * Math.PI * 2;
    const bell = engineBell(r * (engineCount === 5 ? 0.2 : 0.22), engineY);
    bell.position.x = Math.cos(a) * ringR;
    bell.position.z = Math.sin(a) * ringR;
    stageGroup.add(bell);
  }
}

function gridFin(radius, y) {
  const shape = new THREE.Shape();
  const w = radius * 0.35;
  const h = radius * 0.5;
  shape.moveTo(0, 0);
  shape.lineTo(w, 0);
  shape.lineTo(0, h);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: false });
  const mat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.5, roughness: 0.5 });
  const fin = new THREE.Mesh(geo, mat);
  fin.position.set(radius * 0.95, y, 0);
  fin.rotation.y = Math.PI / 2;
  return fin;
}

function starshipFin(radius, y, angle) {
  const geo = new THREE.BoxGeometry(radius * 0.25, radius * 1.1, 0.06);
  const mat = new THREE.MeshStandardMaterial({ color: 0x3a3a40, metalness: 0.55, roughness: 0.4 });
  const fin = new THREE.Mesh(geo, mat);
  fin.position.set(Math.cos(angle) * radius * 1.02, y, Math.sin(angle) * radius * 1.02);
  fin.rotation.y = -angle;
  return fin;
}


function buildSoyuzBoosters(stageGroup, coreR, h, colors) {
  const br = coreR * 0.82;
  const bh = h * 0.92;
  const offsets = [
    [coreR * 1.12, 0, 0],
    [-coreR * 1.12, 0, 0],
    [0, 0, coreR * 1.12],
    [0, 0, -coreR * 1.12],
  ];
  offsets.forEach(([x, , z]) => {
    const body = cylinder(br, bh, colors.body, bh / 2);
    body.position.set(x, 0, z);
    stageGroup.add(body);
    const skirt = cylinder(br * 1.03, bh * 0.1, colors.accent, bh * 0.05);
    skirt.position.set(x, 0, z);
    stageGroup.add(skirt);
    const bell = engineBell(br * 0.55, bh * 0.05);
    bell.position.set(x, 0, z);
    stageGroup.add(bell);
  });
}

function saturnRollPattern(stageGroup, r, bodyH) {
  const band = cylinder(r * 1.005, bodyH * 0.08, 0x1a1a1a, bodyH * 0.92);
  const band2 = cylinder(r * 1.005, bodyH * 0.06, 0x1a1a1a, bodyH * 0.55);
  stageGroup.add(band, band2);
}

/**
 * @returns {{ root: THREE.Group, stageMeshes: THREE.Object3D[], totalHeight: number }}
 */
export function buildRocketMesh(rocket) {
  const root = new THREE.Group();
  root.name = rocket.id;
  const stageMeshes = [];
  const r = (rocket.diameter / 2) * SCALE;
  let stackY = 0;

  rocket.stages.forEach((stage, index) => {
    const stageGroup = new THREE.Group();
    stageGroup.name = stage.id;
    stageGroup.userData = {
      stageIndex: index,
      rocketId: rocket.id,
      label: stage.nama,
      hasEngines: !stage.isFairing && !stage.isPayload && stage.engines > 0,
    };

    const h = stage.height * SCALE;

    if (stage.layout === "soyuz-boosters") {
      buildSoyuzBoosters(stageGroup, r, h, stage.colors);
    } else if (stage.isFairing) {
      stageGroup.add(cone(r * 1.02, h, stage.colors.body, h / 2));
    } else if (stage.isPayload) {
      const bodyH = h * 0.65;
      stageGroup.add(cylinder(r * 0.75, bodyH, stage.colors.body, bodyH / 2));
      stageGroup.add(cone(r * 0.55, h * 0.35, stage.colors.accent, bodyH + h * 0.15));
    } else {
      const bodyH = h * 0.88;
      stageGroup.add(cylinder(r, bodyH, stage.colors.body, bodyH / 2));

      const skirtH = h * 0.12;
      stageGroup.add(cylinder(r * 1.02, skirtH, stage.colors.accent, skirtH / 2));

      if (rocket.id === "saturnv" && index === 0) {
        saturnRollPattern(stageGroup, r, bodyH);
      }

      const engineY = skirtH * 0.5;
      if (stage.engines > 0) {
        addEngines(stageGroup, r, stage.engines, engineY);
      }

      if (index === 0 && rocket.id === "falcon9") {
        for (let i = 0; i < 4; i++) {
          const fin = gridFin(r, h * 0.22);
          fin.rotation.y = (i / 4) * Math.PI * 2;
          stageGroup.add(fin);
        }
      }

      if (stage.hasFins) {
        for (let i = 0; i < 4; i++) {
          stageGroup.add(starshipFin(r, h * 0.35, (i / 4) * Math.PI * 2));
        }
        stageGroup.add(cone(r * 0.85, h * 0.18, 0xd0d2d8, h - h * 0.09));
      }
    }

    stageGroup.position.y = stackY;
    root.add(stageGroup);
    stageMeshes.push(stageGroup);
    stackY += h;
  });

  root.userData.totalHeight = stackY;
  return { root, stageMeshes, totalHeight: stackY };
}

export { SCALE };
