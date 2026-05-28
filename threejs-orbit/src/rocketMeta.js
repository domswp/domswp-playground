/** Profil misi, lingkungan launch, metadata roket (payload per misi). */

export const MISSIONS = {
  leo: {
    id: "leo",
    label: "LEO",
    nama: "Orbit Bumi rendah",
    dvRequired: 9_400,
    altitude: "~400 km",
  },
  gto: {
    id: "gto",
    label: "GTO",
    nama: "Transfer orbit geo",
    dvRequired: 12_000,
    altitude: "~36.000 km (apo)",
  },
  tli: {
    id: "tli",
    label: "TLI",
    nama: "Menuju Bulan",
    dvRequired: 15_700,
    altitude: "Translunar",
  },
};

export const ENVIRONMENTS = {
  standard: {
    id: "standard",
    label: "Normal",
    thrustMult: 1,
    note: "Kondisi rata-rata Cape / Baikonur",
  },
  hot: {
    id: "hot",
    label: "Panas",
    thrustMult: 0.97,
    note: "Thrust sedikit turun, atmosfer tipis",
  },
  cold: {
    id: "cold",
    label: "Dingin",
    thrustMult: 1.02,
    note: "Thrust sedikit naik (propelan padat)",
  },
};

/**
 * Payload maksimum (kg) per misi — referensi publik, dibulatkan.
 * null = bukan konfigurasi umum untuk roket ini.
 */
export const ROCKET_META = {
  falcon9: {
    negara: "Amerika Serikat",
    operator: "SpaceX",
    sumber: "SpaceX, NASA (publik)",
    recovery: ["RTLS", "Autonomous drone ship", "Expendable"],
    missions: { leo: 22_800, gto: 8_300, tli: null },
  },
  starship: {
    negara: "Amerika Serikat",
    operator: "SpaceX",
    sumber: "SpaceX (target/publik)",
    recovery: ["Booster + Ship (rencana)"],
    missions: { leo: 150_000, gto: 21_000, tli: 100_000 },
  },
  saturnv: {
    negara: "Amerika Serikat",
    operator: "NASA",
    sumber: "NASA Apollo Program",
    recovery: ["Sekali pakai"],
    missions: { leo: 140_000, gto: null, tli: 43_000 },
  },
  soyuz: {
    negara: "Rusia",
    operator: "Roscosmos",
    sumber: "Roscosmos, NASA Launch Services",
    recovery: ["Sekali pakai"],
    missions: { leo: 7_050, gto: 3_250, tli: null },
  },
  sls: {
    negara: "Amerika Serikat",
    operator: "NASA",
    sumber: "NASA SLS Program",
    recovery: ["Sekali pakai (Artemis)"],
    missions: { leo: 95_000, gto: null, tli: 27_000 },
  },
};
