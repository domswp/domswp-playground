import * as THREE from "three";

/**
 * Plume api di bawah stage (additive, ringan untuk mobile).
 */
export function createStageExhaust(stageGroup, scale = 1) {
  const root = new THREE.Group();
  root.name = "exhaust";

  const innerGeo = new THREE.ConeGeometry(0.35 * scale, 1.4 * scale, 10, 1, true);
  const outerGeo = new THREE.ConeGeometry(0.55 * scale, 2.0 * scale, 10, 1, true);

  const innerMat = new THREE.MeshBasicMaterial({
    color: 0xffdd66,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0xff6622,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const inner = new THREE.Mesh(innerGeo, innerMat);
  const outer = new THREE.Mesh(outerGeo, outerMat);
  inner.rotation.x = Math.PI;
  outer.rotation.x = Math.PI;
  inner.position.y = -0.15 * scale;
  outer.position.y = -0.35 * scale;

  root.add(outer, inner);
  root.visible = false;
  stageGroup.add(root);

  let active = false;
  let intensity = 0;
  let flicker = 0;

  return {
    root,
    setActive(on, power = 1) {
      active = on;
      intensity = on ? power : 0;
      root.visible = on && power > 0.05;
    },
    get active() {
      return active;
    },
    update(dt) {
      if (!active) return;
      flicker += dt * 12;
      const wobble = 0.85 + Math.sin(flicker) * 0.12 + Math.sin(flicker * 2.3) * 0.06;
      const s = intensity * wobble;
      inner.scale.set(s, s * (1.1 + Math.sin(flicker * 1.7) * 0.15), s);
      outer.scale.set(s * 1.15, s * 1.2, s * 1.15);
      innerMat.opacity = 0.75 + Math.sin(flicker * 3) * 0.12;
    },
    dispose() {
      innerGeo.dispose();
      outerGeo.dispose();
      innerMat.dispose();
      outerMat.dispose();
      stageGroup.remove(root);
    },
  };
}
