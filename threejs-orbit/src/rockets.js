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

  saturnv: {
    id: "saturnv",
    label: "Saturn V",
    tinggi: 111,
    diameter: 10.1,
    payloadLeo: 140_000,
    reusable: "Sekali pakai",
    firstFlight: 1967,
    fuel: "Kerosene / LOX + Hidrogen / LOX",
    stages: [
      {
        id: "sic",
        nama: "S-IC (5× F-1)",
        mesin: "F-1",
        engines: 5,
        massaStruktur: 131_000,
        massaBB: 2_077_000,
        thrust: 33_850_000,
        ispVac: 263,
        burnTime: 168,
        height: 46,
        colors: { body: 0xf2f2f0, accent: 0x1a1a1a },
        exhaustScale: 1.35,
      },
      {
        id: "sii",
        nama: "S-II (5× J-2)",
        mesin: "J-2",
        engines: 5,
        massaStruktur: 40_000,
        massaBB: 444_000,
        thrust: 5_141_000,
        ispVac: 421,
        burnTime: 360,
        height: 32,
        colors: { body: 0xeeeee8, accent: 0x3a3a3a },
        exhaustScale: 0.75,
      },
      {
        id: "sivb",
        nama: "S-IVB (1× J-2)",
        mesin: "J-2",
        engines: 1,
        massaStruktur: 13_000,
        massaBB: 106_000,
        thrust: 1_033_000,
        ispVac: 421,
        burnTime: 500,
        height: 22,
        colors: { body: 0xf5f5f0, accent: 0x2a2a2a },
        exhaustScale: 0.55,
      },
      {
        id: "les",
        nama: "Apollo (LM + CSM)",
        mesin: "—",
        engines: 0,
        massaStruktur: 12_000,
        massaBB: 0,
        thrust: 0,
        ispVac: 0,
        burnTime: 0,
        height: 11,
        colors: { body: 0xd8d8d0, accent: 0x888888 },
        isPayload: true,
      },
    ],
  },
  soyuz: {
    id: "soyuz",
    label: "Soyuz-2.1a",
    tinggi: 46.3,
    diameter: 2.95,
    payloadLeo: 7_050,
    reusable: "Tidak",
    firstFlight: 2004,
    fuel: "Kerosene / LOX (RP-1)",
    stages: [
      {
        id: "blok-b",
        nama: "4× Blok B (booster)",
        mesin: "RD-107A",
        engines: 4,
        massaStruktur: 14_000,
        massaBB: 156_400,
        thrust: 3_352_000,
        ispVac: 263,
        burnTime: 118,
        height: 19,
        colors: { body: 0xa8a090, accent: 0x4a4840 },
        exhaustScale: 0.85,
        layout: "soyuz-boosters",
      },
      {
        id: "blok-a",
        nama: "Blok A (inti tahap 1)",
        mesin: "RD-108A",
        engines: 4,
        massaStruktur: 6_100,
        massaBB: 91_500,
        thrust: 934_000,
        ispVac: 263,
        burnTime: 286,
        height: 27,
        colors: { body: 0xb0a898, accent: 0x3d3a35 },
        exhaustScale: 0.65,
      },
      {
        id: "blok-i",
        nama: "Blok I (tahap 2)",
        mesin: "RD-0124",
        engines: 1,
        massaStruktur: 2_350,
        massaBB: 22_100,
        thrust: 297_000,
        ispVac: 359,
        burnTime: 424,
        height: 7,
        colors: { body: 0xbcbab2, accent: 0x454540 },
        exhaustScale: 0.45,
      },
      {
        id: "fairing",
        nama: "Payload fairing",
        mesin: "—",
        engines: 0,
        massaStruktur: 1_200,
        massaBB: 0,
        thrust: 0,
        ispVac: 0,
        burnTime: 0,
        height: 8,
        colors: { body: 0xd8d6ce, accent: 0x999999 },
        isFairing: true,
      },
    ],
  },
};

/** Massa total basah di atas stage index (termasuk stage itu + di atasnya + payload). */
export function massAbove(rocket, stageIndex, payloadKg = 0) {
  let m = payloadKg;
  for (let i = rocket.stages.length - 1; i >= stageIndex; i--) {
    const s = rocket.stages[i];
    if (s.isFairing || s.isPayload) {
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
  const payload = stage.isFairing || stage.isPayload ? 0 : rocket.payloadLeo * 0.3; // perkiraan untuk demo
  const m0 = massAbove(rocket, stageIndex, stage.isFairing || stage.isPayload ? rocket.payloadLeo : payload);
  const mf = stage.isFairing || stage.isPayload
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
    payloadUsed: stage.isFairing || stage.isPayload ? rocket.payloadLeo : payload,
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
