import { EARTH_MESH_RADIUS, EARTH_RADIUS_KM } from "./constants.js";

/**
 * Geodetic (radian, km) → posisi scene Three.js (Y = kutub utara).
 */
export function geodeticToVector3(latRad, lonRad, heightKm = 0) {
  const r = EARTH_MESH_RADIUS * (1 + heightKm / EARTH_RADIUS_KM);
  const cosLat = Math.cos(latRad);
  const x = r * cosLat * Math.cos(lonRad);
  const y = r * Math.sin(latRad);
  const z = -r * cosLat * Math.sin(lonRad);
  return { x, y, z };
}

export function geodeticToThree(latRad, lonRad, heightKm, target) {
  const p = geodeticToVector3(latRad, lonRad, heightKm);
  return target.set(p.x, p.y, p.z);
}

export function radToDeg(rad) {
  return (rad * 180) / Math.PI;
}

export function normalizeLonDeg(lon) {
  let v = lon;
  while (v > 180) v -= 360;
  while (v < -180) v += 360;
  return v;
}
