import { normalizeLonDeg, radToDeg } from "./coords.js";

export function formatCoord(latRad, lonRad) {
  const lat = radToDeg(latRad);
  const lon = normalizeLonDeg(radToDeg(lonRad));
  const latStr = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? "N" : "S"}`;
  const lonStr = `${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? "E" : "W"}`;
  return `${latStr}, ${lonStr}`;
}

export function formatAlt(km) {
  return `${km.toFixed(1)} km`;
}

export function formatSpeed(kmh) {
  if (!isFinite(kmh)) return "—";
  return `${Math.round(kmh).toLocaleString("id-ID")} km/jam`;
}

export function formatUnix(ts) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleString("id-ID", {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

export function visibilityLabel(v) {
  if (!v) return "—";
  const map = {
    daylight: "Siang (langit)",
    eclipsed: "Bayangan Bumi",
  };
  return map[v] || v;
}
