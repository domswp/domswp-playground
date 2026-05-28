import {
  formatAlt,
  formatCoord,
  formatSpeed,
  formatUnix,
  visibilityLabel,
} from "./format.js";
import { radToDeg } from "./coords.js";

const panel = document.getElementById("telemetry-panel");
const toggle = document.getElementById("telemetry-toggle");
const summary = document.getElementById("telemetry-summary");
const statsEl = document.getElementById("telemetry-stats");
const noteEl = document.getElementById("telemetry-note");
const statusChip = document.getElementById("status-chip");

let lastTelemetry = null;

function setPanelExpanded(expanded) {
  panel.classList.toggle("collapsed", !expanded);
  toggle.setAttribute("aria-expanded", String(expanded));
}

function renderStats(data) {
  const rows = [
    ["Posisi", formatCoord(data.latRad, data.lonRad)],
    ["Ketinggian", formatAlt(data.altKm)],
    ["Kecepatan", formatSpeed(data.velocityKmS)],
    ["Visibilitas", data.visibility || "—"],
    ["Sinkron API", data.apiSyncLabel || "—"],
    ["TLE diperbarui", data.tleLabel || "—"],
  ];
  statsEl.innerHTML = rows
    .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`)
    .join("");
}

export function initUI({ onFollowToggle, onOrbitToggle, onResetCamera }) {
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    setPanelExpanded(panel.classList.contains("collapsed"));
  });
  setPanelExpanded(false);

  document.getElementById("btn-follow").addEventListener("click", onFollowToggle);
  document.getElementById("btn-orbit").addEventListener("click", onOrbitToggle);
  document.getElementById("btn-reset").addEventListener("click", onResetCamera);
}

export function setStatus(text, kind = "ok") {
  statusChip.textContent = text;
  statusChip.dataset.kind = kind;
}

export function setFollowActive(active) {
  document.getElementById("btn-follow").classList.toggle("active", active);
}

export function setOrbitVisible(visible) {
  document.getElementById("btn-orbit").classList.toggle("active", visible);
}

export function updateTelemetry({
  latRad,
  lonRad,
  altKm,
  velocityKmS,
  visibility,
  apiSyncLabel,
  tleLabel,
  note,
}) {
  lastTelemetry = { latRad, lonRad, altKm, velocityKmS, visibility, apiSyncLabel, tleLabel };
  summary.textContent = `${formatCoord(latRad, lonRad)} · ${formatAlt(altKm)}`;
  renderStats(lastTelemetry);
  if (note) noteEl.textContent = note;
}

export function updateTelemetryFromApi(api, propagated) {
  const latRad = (api.latitude * Math.PI) / 180;
  const lonRad = (api.longitude * Math.PI) / 180;
  const note =
    propagated?.latRad != null
      ? `Propagasi: ${formatCoord(propagated.latRad, propagated.lonRad)} · selisih ~${driftKm(
          api,
          propagated
        )} km`
      : "";
  updateTelemetry({
    latRad,
    lonRad,
    altKm: api.altitude,
    velocityKmS: api.velocity / 1000,
    visibility: visibilityLabel(api.visibility),
    apiSyncLabel: formatUnix(api.timestamp),
    tleLabel: propagated?.tleLabel ?? "—",
    note,
  });
}

function driftKm(api, prop) {
  const dLat = api.latitude - radToDeg(prop.latRad);
  const dLon = api.longitude - radToDeg(prop.lonRad);
  const approx = Math.sqrt(dLat * dLat + dLon * dLon) * 111;
  return approx.toFixed(0);
}
