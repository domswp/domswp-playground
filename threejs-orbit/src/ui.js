import {
  ROCKETS,
  computeStageStats,
  formatMass,
  formatThrust,
} from "./rockets.js";

const panel = document.getElementById("info-panel");
const titleEl = document.getElementById("panel-title");
const statsEl = document.getElementById("panel-stats");
const noteEl = document.getElementById("panel-note");

export function initUI({ onRocketChange, onStageToggle, onResetCamera }) {
  const select = document.getElementById("rocket-select");
  const btnStage = document.getElementById("btn-stage");
  const btnReset = document.getElementById("btn-reset");
  const btnClose = document.getElementById("panel-close");

  select.addEventListener("change", () => onRocketChange(select.value));
  btnStage.addEventListener("click", onStageToggle);
  btnReset.addEventListener("click", onResetCamera);
  btnClose.addEventListener("click", hidePanel);

  return { getRocketKey: () => select.value };
}

export function hidePanel() {
  panel.classList.add("hidden");
}

export function showStageInfo(rocketKey, stageIndex) {
  const rocket = ROCKETS[rocketKey];
  const stage = rocket.stages[stageIndex];
  const stats = computeStageStats(rocket, stageIndex);

  titleEl.textContent = stage.nama;

  const rows = [
    ["Roket", rocket.label],
    ["Mesin", stage.mesin],
    ["Jumlah mesin", stage.engines || "—"],
    ["Bahan bakar", rocket.fuel],
    ["Massa struktur", formatMass(stage.massaStruktur)],
    ["Bahan bakar (stage)", stage.massaBB ? formatMass(stage.massaBB) : "—"],
    ["Massa awal (m₀)*", formatMass(stats.m0)],
    ["Massa akhir (mf)*", formatMass(stats.mf)],
    ["Thrust (vac)", stage.thrust ? formatThrust(stage.thrust) : "—"],
    ["Isp (vac)", stage.ispVac ? `${stage.ispVac} s` : "—"],
    ["Δv (stage)*", stats.dv ? `${(stats.dv / 1000).toFixed(2)} km/s` : "—"],
    ["TWR awal*", stats.twr !== "—" ? stats.twr : "—"],
    ["Burn time", stage.burnTime ? `${stage.burnTime} s` : "—"],
  ];

  if (stage.isFairing) {
    rows.push(["Payload LEO (ref.)", formatMass(rocket.payloadLeo)]);
  }

  statsEl.innerHTML = rows
    .map(
      ([k, v]) =>
        `<dt>${k}</dt><dd>${v}</dd>`
    )
    .join("");

  noteEl.textContent =
    "* m₀/mf/Δv/TWR: perkiraan dari data rocket-sim (Tsiolkovsky). Bukan data penerbangan real-time. Klik stage lain atau ganti roket.";

  panel.classList.remove("hidden");
}

export function setStageButtonLabel(staged) {
  const btn = document.getElementById("btn-stage");
  btn.textContent = staged ? "Gabungkan stage" : "Simulasi staging";
}
