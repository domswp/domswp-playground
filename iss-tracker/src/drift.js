import { EARTH_RADIUS_KM } from "./constants.js";

function wrapPi(radians) {
  return Math.atan2(Math.sin(radians), Math.cos(radians));
}

/** Jarak horizontal (km) antara posisi API (derajat) dan propagasi (radian). */
export function horizontalDriftKm(apiLatDeg, apiLonDeg, propLatRad, propLonRad) {
  const lat1 = (apiLatDeg * Math.PI) / 180;
  const lon1 = (apiLonDeg * Math.PI) / 180;
  const dLat = propLatRad - lat1;
  const dLon = wrapPi(propLonRad - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(propLatRad) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  return EARTH_RADIUS_KM * c;
}
