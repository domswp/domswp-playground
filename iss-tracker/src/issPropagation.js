import * as satellite from "satellite.js";
import { ISS_ORBIT_PERIOD_MIN } from "./constants.js";

let satrec = null;

export function setTle(line1, line2) {
  satrec = satellite.twoline2satrec(line1, line2);
}

export function hasTle() {
  return satrec !== null;
}

export function getIssState(date = new Date()) {
  if (!satrec) return null;
  const pv = satellite.propagate(satrec, date);
  if (!pv?.position) return null;

  const gmst = satellite.gstime(date);
  const gd = satellite.eciToGeodetic(pv.position, gmst);
  let speedKmS = 0;
  if (pv.velocity) {
    const { x, y, z } = pv.velocity;
    speedKmS = Math.sqrt(x * x + y * y + z * z);
  }

  return {
    latitude: gd.latitude,
    longitude: gd.longitude,
    height: gd.height,
    velocityKmS: speedKmS,
    date,
  };
}

/** Titik satu putaran orbit untuk garis 3D. */
export function sampleOrbitGeodetic(pointCount = 128, startDate = new Date()) {
  if (!satrec) return [];
  const periodMs = ISS_ORBIT_PERIOD_MIN * 60 * 1000;
  const step = periodMs / pointCount;
  const points = [];
  for (let i = 0; i <= pointCount; i++) {
    const d = new Date(startDate.getTime() + i * step);
    const state = getIssState(d);
    if (state) points.push(state);
  }
  return points;
}
