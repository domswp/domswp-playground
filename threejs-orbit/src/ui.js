import { ROCKETS } from "./rockets.js";
import {
  MISSIONS,
  ENVIRONMENTS,
  } from "./rocketMeta.js";
import {
  computeStageStats,
  assessMission,
  getStagingEvents,
  getMeta,
  missionSupported,
} from "./simulation.js";
import { formatMass, formatThrust, formatDv } from "./format.js";

const panel = document.getElementById("info-panel");
const titleEl = document.getElementById("panel-title");
const statsEl = document.getElementById("panel-stats");
const noteEl = document.getElementById("panel-note");
const missionPanel = document.getElementById("mission-panel");
const comparePanel = document.getElementById("compare-panel");

let missionId = "leo";
let envId = "standard";
let compareKey = "saturnv";
let compareVisible = false;

export function getSimState() {
  return { missionId, envId, compareKey, compareVisible };
}

export function initUI({
  onRocketChange,
  onStageToggle,
  onResetCamera,
  onSimChange,
}) {
  const select = document.getElementById("rocket-select");
  const missionSelect = document.getElementById("mission-select");
  const envSelect = document.getElementById("env-select");
  const compareSelect = document.getElementById("compare-select");
  const btnCompare = document.getElementById("btn-compare");
  const btnStage = document.getElementById("btn-stage");
  const btnReset = document.getElementById("btn-reset");
  const btnClose = document.getElementById("panel-close");

  select.addEventListener("change", () => {
    onRocketChange(select.value);
    refreshMissionPanel(select.value);
    if (compareVisible) refreshCompare(select.value);
  });

  missionSelect.addEventListener("change", () => {
    missionId = missionSelect.value;
    onSimChange();
    refreshMissionPanel(select.value);
    if (compareVisible) refreshCompare(select.value);
  });

  envSelect.addEventListener("change", () => {
    envId = envSelect.value;
    onSimChange();
    refreshMissionPanel(select.value);
    if (compareVisible) refreshCompare(select.value);
  });

  compareSelect.addEventListener("change", () => {
    compareKey = compareSelect.value;
    if (compareVisible) refreshCompare(select.value);
  });

  const compareOnly = () =>
    document.querySelectorAll(".compare-only").forEach((el) => {
      el.classList.toggle("hidden", !compareVisible);
    });

  btnCompare.addEventListener("click", () => {
    compareVisible = !compareVisible;
    btnCompare.classList.toggle("active", compareVisible);
    comparePanel.classList.toggle("hidden", !compareVisible);
    compareOnly();
    if (compareVisible) refreshCompare(select.value);
  });

  btnStage.addEventListener("click", onStageToggle);
  btnReset.addEventListener("click", onResetCamera);
  btnClose.addEventListener("click", hidePanel);

  refreshMissionPanel(select.value);
  return { getRocketKey: () => select.value };
}

export function hidePanel() {
  panel.classList.add("hidden");
}

export function refreshMissionPanel(rocketKey) {
  const rocket = ROCKETS[rocketKey];
  const meta = getMeta(rocket);
  const assessment = assessMission(rocket, missionId, envId);
  const mission = MISSIONS[missionId];
  const env = ENVIRONMENTS[envId];
  const events = getStagingEvents(rocket);

  const statusClass =
    assessment.status === "ok"
      ? "status-ok"
      : assessment.status === "na"
        ? "status-na"
        : "status-warn";

  const rows = [
    ["Roket", rocket.label],
    ["Negara", meta.negara ?? "—"],
    ["Operator", meta.operator ?? "—"],
    ["Misi", `${mission.label} — ${mission.nama}`],
    ["Lingkungan", `${env.label} (${env.note})`],
    ["Payload misi", missionSupported(rocket, missionId) ? formatMass(assessment.payload) : "N/A"],
    ["Massa liftoff", formatMass(assessment.liftoffMass)],
    ["TWR liftoff", assessment.twr != null ? assessment.twr.toFixed(2) : "—"],
    ["Δv total (est.)", formatDv(assessment.totalDv)],
    ["Δv dibutuhkan", formatDv(assessment.dvRequired)],
    ["Reusable", rocket.reusable],
    ["Bahan bakar", rocket.fuel],
  ];

  missionPanel.innerHTML = `
    <h2 class="panel-heading">Simulasi misi</h2>
    <p class="assessment ${statusClass}">${assessment.summary}</p>
    <dl class="stats-compact">
      ${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}
    </dl>
    <h3 class="sub-heading">Urutan staging</h3>
    <ol class="event-list">
      ${events
        .map(
          (e, i) =>
            `<li><span>${i + 1}.</span> ${e.label}${e.hasEngines ? " 🔥" : ""}</li>`
        )
        .join("")}
    </ol>
  `;
}

export function refreshCompare(primaryKey) {
  const a = ROCKETS[primaryKey];
  const b = ROCKETS[compareKey];
  if (!a || !b) return;

  const aa = assessMission(a, missionId, envId);
  const ab = assessMission(b, missionId, envId);

  const row = (label, va, vb) =>
    `<tr><td>${label}</td><td>${va}</td><td>${vb}</td></tr>`;

  comparePanel.innerHTML = `
    <h2 class="panel-heading">Bandingkan</h2>
    <table class="compare-table">
      <thead>
        <tr><th></th><th>${a.label}</th><th>${b.label}</th></tr>
      </thead>
      <tbody>
        ${row("Payload", missionSupported(a, missionId) ? formatMass(aa.payload) : "N/A", missionSupported(b, missionId) ? formatMass(ab.payload) : "N/A")}
        ${row("Liftoff", formatMass(aa.liftoffMass), formatMass(ab.liftoffMass))}
        ${row("TWR", aa.twr?.toFixed(2) ?? "—", ab.twr?.toFixed(2) ?? "—")}
        ${row("Δv total", formatDv(aa.totalDv), formatDv(ab.totalDv))}
        ${row("Tinggi", `${a.tinggi} m`, `${b.tinggi} m`)}
      </tbody>
    </table>
    <p class="note">Misi: ${MISSIONS[missionId].label} · Lingkungan: ${ENVIRONMENTS[envId].label}</p>
  `;
}

export function showStageInfo(rocketKey, stageIndex) {
  const rocket = ROCKETS[rocketKey];
  const stage = rocket.stages[stageIndex];
  const stats = computeStageStats(rocket, stageIndex, missionId, envId);
  const meta = getMeta(rocket);

  titleEl.textContent = stage.nama;

  const rows = [
    ["Roket", rocket.label],
    ["Misi aktif", MISSIONS[missionId].label],
    ["Mesin", stage.mesin],
    ["Jumlah mesin", stage.engines || "—"],
    ["Bahan bakar", rocket.fuel],
    ["Massa struktur", formatMass(stage.massaStruktur)],
    ["Bahan bakar (stage)", stage.massaBB ? formatMass(stage.massaBB) : "—"],
    ["Payload (misi)", formatMass(stats.payloadUsed)],
    ["Massa awal (m₀)", formatMass(stats.m0)],
    ["Massa akhir (mf)", formatMass(stats.mf)],
    ["Thrust (adj.)", stage.thrust ? formatThrust(stats.thrust) : "—"],
    ["Isp (vac)", stage.ispVac ? `${stage.ispVac} s` : "—"],
    ["Δv (stage)", formatDv(stats.dv)],
    ["TWR (stage)", stats.twr !== "—" ? stats.twr : "—"],
    ["Burn time", stage.burnTime ? `${stage.burnTime} s` : "—"],
  ];

  if (stage.isFairing || stage.isPayload) {
    rows.push(["Kapasitas misi", formatMass(stats.payloadUsed)]);
  }

  if (meta.recovery?.length) {
    rows.push(["Recovery", meta.recovery.join(", ")]);
  }

  statsEl.innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");

  noteEl.textContent =
    `Lingkungan: ${ENVIRONMENTS[envId].label}. Δv/TWR perkiraan (Tsiolkovsky). Bukan telemetri live. Sumber: ${meta.sumber ?? "referensi online"}.`;

  panel.classList.remove("hidden");
}

export function setStageButtonLabel(staged) {
  const btn = document.getElementById("btn-stage");
  btn.textContent = staged ? "Gabungkan stage" : "Peluncuran & staging";
}

export function setStageButtonDisabled(disabled) {
  document.getElementById("btn-stage").disabled = disabled;
}
