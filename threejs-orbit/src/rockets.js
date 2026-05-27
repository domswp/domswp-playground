/**
 * Data roket — selaras dengan rocket-sim/04_falcon9_vs_starship.py
 * Tinggi stage: perkiraan proporsional untuk visual 3D.
 */

const G0 = 9.80665;

export const ROCKETS = {
  falcon9: {
    id: "falcon9",
    label: "Falcon 9",
    tinggi: 70,
    diameter: 3.7,
    payloadLeo: 22_800,
    reusable: "Stage 1",
    firstFlight: 2010,
    fuel: "Kerosene / LOX",
    stages: [
      {
        id: "s1",
        nama: "Stage 1 (9× Merlin)",
        mesin: "Merlin 1D",
        engines: 9,
        massaStruktur: 25_600,
        massaBB: 395_700,
        thrust: 7_607_000,
        ispVac: 311,
        burnTime: 162,
        height: 42,
        colors: { body: 0xf4f4f4, accent: 0x1a1a1a },
      },
      {
        id: "s2",
        nama: "Stage 2 (1× Merlin Vac)",
        mesin: "Merlin 1D Vac",
        engines: 1,
        massaStruktur: 3_900,
        massaBB: 92_670,
        thrust: 934_000,
        ispVac: 348,
        burnTime: 397,
        height: 14,
        colors: { body: 0xf0f0f0, accent: 0x333333 },
      },
      {
        id: "fairing",
        nama: "Payload fairing",
        mesin: "—",
        engines: 0,
        massaStruktur: 1_900,
        massaBB: 0,
        thrust: 0,
        ispVac: 0,
        burnTime: 0,
        height: 14,
        colors: { body: 0xffffff, accent: 0xcccccc },
        isFairing: true,
      },
    ],
  },

  starship: {
    id: "starship",
    label: "Starship + Super Heavy",
    tinggi: 121,
    diameter: 9.0,
    payloadLeo: 150_000,
    reusable: "Booster + Ship",
    firstFlight: 2023,
    fuel: "Metana / LOX",
    stages: [
      {
        id: "booster",
        nama: "Super Heavy (33× Raptor)",
        mesin: "Raptor 2",
        engines: 33,
        massaStruktur: 200_000,
        massaBB: 3_400_000,
        thrust: 74_000_000,
        ispVac: 350,
        burnTime: 160,
        height: 71,
        colors: { body: 0x8a8d94, accent: 0x2a2a2e },
      },
      {
        id: "ship",
        nama: "Starship (6× Raptor)",
        mesin: "Raptor 2",
        engines: 6,
        massaStruktur: 100_000,
        massaBB: 1_200_000,
        thrust: 14_700_000,
        ispVac: 350,
        burnTime: 360,
        height: 50,
        colors: { body: 0x9ca0a8, accent: 0x1e1e22 },
        hasFins: true,
      },
    ],
  },
};

/** Massa total basah di atas stage index (termasuk stage itu + di atasnya + payload). */
export function massAbove(rocket, stageIndex, payloadKg = 0) {
  let m = payloadKg;
  for (let i = rocket.stages.length - 1; i >= stageIndex; i--) {
    const s = rocket.stages[i];
    if (s.isFairing) {
      m += s.massaStruktur;
    } else {
      m += s.massaStruktur + s.massaBB;
    }
  }
  return m;
}

/** Δv stage tunggal (Tsiolkovsky), kg. */
export function deltaVStage(stage, m0, mf) {
  if (!stage.ispVac || stage.massaBB === 0) return 0;
  if (mf <= 0 || m0 <= mf) return 0;
  return stage.ispVac * G0 * Math.log(m0 / mf);
}

export function computeStageStats(rocket, stageIndex) {
  const stage = rocket.stages[stageIndex];
  const payload = stage.isFairing ? 0 : rocket.payloadLeo * 0.3; // perkiraan untuk demo
  const m0 = massAbove(rocket, stageIndex, stage.isFairing ? rocket.payloadLeo : payload);
  const mf = stage.isFairing
    ? m0 - stage.massaStruktur
    : m0 - stage.massaBB;
  const dv = deltaVStage(stage, m0, mf);
  const twr =
    stage.thrust > 0 && m0 > 0 ? (stage.thrust / (m0 * G0)).toFixed(2) : "—";

  return {
    m0,
    mf,
    dv,
    twr,
    payloadUsed: stage.isFairing ? rocket.payloadLeo : payload,
  };
}

export function formatMass(kg) {
  if (kg >= 1_000_000) return `${(kg / 1_000_000).toFixed(2)} t`;
  if (kg >= 1_000) return `${(kg / 1_000).toFixed(1)} t`;
  return `${kg.toFixed(0)} kg`;
}

export function formatThrust(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} MN`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)} kN`;
  return `${n.toFixed(0)} N`;
}
