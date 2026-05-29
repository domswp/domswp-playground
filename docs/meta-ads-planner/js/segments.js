// Preset targeting properti (rule-based) — CONTOH AWAL.
// Silakan sesuaikan: tambah/ubah segmen, interest, persona, copy, ide konten.
// Kunci preset = `${produk}_${segmenHarga}`.
//
// produk: "rumah" | "apartemen" | "ruko"
// segmenHarga: "subsidi" | "menengah" | "premium"
//
// Slot copy: {lokasi} {harga} {dp} {promo}

export const PRODUK_LABEL = {
  rumah: "Rumah tapak",
  apartemen: "Apartemen",
  ruko: "Ruko / komersial",
};

export const SEGMEN_LABEL = {
  subsidi: "Subsidi / entry (≤ Rp 500 jt)",
  menengah: "Menengah (Rp 500 jt – 1,5 M)",
  premium: "Premium (> Rp 1,5 M)",
};

// Benchmark CTR/CVR konservatif HANYA untuk diagnostik (dibandingkan dgn data user).
// Bukan angka resmi — silakan kalibrasi.
export const BENCHMARK = {
  ctrPct: 1.1, // CTR wajar properti (link click) ~1.1%
  clickToLeadPct: 6, // klik → leads ~6%
};

export const SEGMENTS = {
  rumah_subsidi: {
    persona:
      "Pasangan muda / keluarga baru 23–35, penghasilan tetap, cari rumah pertama dengan cicilan terjangkau (KPR subsidi/FLPP).",
    umur: [23, 38],
    gender: "Semua",
    radiusKm: 25,
    interest: [
      "KPR / Mortgage loans",
      "Rumah subsidi / FLPP",
      "First-time home buyer",
      "Perumahan",
      "Cicilan / kredit",
    ],
    exclude: ["Agen properti / Real estate agent"],
    angle: ["DP ringan & cicilan terjangkau", "Dekat akses kerja/transportasi", "Legalitas aman (KPR bank)"],
    copy: [
      "Punya rumah sendiri di {lokasi} mulai DP {dp}. Cicilan ringan ala KPR subsidi — unit terbatas, daftar survei sekarang!",
      "Stop ngontrak. Rumah pertama di {lokasi} cuma {harga}, {promo}. Cek simulasi cicilanmu hari ini.",
      "KPR mudah, proses cepat. Rumah idaman keluarga di {lokasi}. Klik untuk info unit & jadwal kunjungan.",
    ],
    konten: [
      "Reels: walkthrough rumah contoh + teks 'cicilan vs ngontrak'",
      "Carousel: rincian DP, cicilan, fasilitas, lokasi",
      "Testimoni penghuni / serah terima kunci",
    ],
  },
  rumah_menengah: {
    persona:
      "Profesional / keluarga 28–45, dual income, upgrade rumah, mementingkan lokasi, lingkungan, dan investasi jangka panjang.",
    umur: [28, 45],
    gender: "Semua",
    radiusKm: 20,
    interest: [
      "KPR / Mortgage loans",
      "Real estate investing",
      "Home improvement",
      "Cluster / perumahan",
      "Sekolah / pendidikan anak",
    ],
    exclude: ["Agen properti / Real estate agent"],
    angle: ["Lokasi strategis & lingkungan asri", "Investasi yang nilainya naik", "Cluster aman untuk keluarga"],
    copy: [
      "Hunian keluarga di kawasan berkembang {lokasi}. Mulai {harga}, {promo}. Lingkungan asri, akses tol dekat. Jadwalkan kunjungan!",
      "Upgrade rumah impian di {lokasi} — desain modern, one gate system. Promo terbatas {promo}.",
      "Bukan sekadar rumah, tapi investasi. {lokasi}, mulai {harga}. Konsultasi KPR gratis.",
    ],
    konten: [
      "Video drone area + fasilitas kawasan",
      "Carousel tipe unit + denah + harga",
      "Reels day-in-the-life keluarga di cluster",
    ],
  },
  rumah_premium: {
    persona:
      "Eksekutif / pengusaha 35–55, high income, cari rumah premium / second home, fokus prestise, privasi, dan kualitas.",
    umur: [33, 55],
    gender: "Semua",
    radiusKm: 30,
    interest: [
      "Luxury real estate",
      "Investasi properti",
      "Mobil mewah / premium brands",
      "Golf / gaya hidup premium",
      "Wealth management",
    ],
    exclude: ["Agen properti / Real estate agent"],
    angle: ["Eksklusif & privat", "Lokasi prestisius", "Kualitas & desain premium"],
    copy: [
      "Hunian eksklusif di {lokasi}. Privasi, desain premium, lokasi terbaik. Mulai {harga}. By appointment only.",
      "Rumah mewah {lokasi} — investasi prestise jangka panjang. {promo}. Private viewing tersedia.",
      "Living at its finest. {lokasi}. Unit terbatas. Hubungi kami untuk presentasi privat.",
    ],
    konten: [
      "Video sinematik rumah + interior",
      "Carousel detail material & spesifikasi premium",
      "Highlight lokasi & lingkungan elit",
    ],
  },

  apartemen_subsidi: {
    persona:
      "First jobber / pasangan muda 22–32 di kota, cari hunian dekat tempat kerja dengan harga masuk akal & cicilan ringan.",
    umur: [22, 34],
    gender: "Semua",
    radiusKm: 15,
    interest: ["KPA / KPR apartemen", "Co-living / kos eksklusif", "Transit / commuter", "First-time home buyer"],
    exclude: ["Agen properti / Real estate agent"],
    angle: ["Dekat tempat kerja & transportasi", "Cicilan ringan", "Praktis untuk anak muda"],
    copy: [
      "Apartemen di {lokasi}, dekat ke mana-mana. Mulai {harga}, DP {dp}. Cocok untuk first jobber!",
      "Daripada ngontrak, mending punya unit sendiri di {lokasi}. {promo}. Cek simulasi KPA.",
      "Hunian praktis di pusat {lokasi}. Akses transportasi mudah. Daftar unit sekarang.",
    ],
    konten: [
      "Reels tour unit tipe studio + fasilitas gedung",
      "Carousel 'kenapa beli > ngontrak'",
      "Highlight akses transportasi/LRT/tol",
    ],
  },
  apartemen_menengah: {
    persona:
      "Profesional muda 27–40, dual income, cari hunian modern dekat CBD, fasilitas lengkap, sekaligus potensi sewa.",
    umur: [27, 42],
    gender: "Semua",
    radiusKm: 18,
    interest: [
      "KPA / KPR apartemen",
      "Real estate investing",
      "Gaya hidup urban",
      "Sewa apartemen / rental",
      "Coffee / lifestyle brands",
    ],
    exclude: ["Agen properti / Real estate agent"],
    angle: ["Lokasi strategis dekat CBD", "Fasilitas lengkap", "Potensi disewakan (passive income)"],
    copy: [
      "Apartemen modern di {lokasi}, dekat CBD. Mulai {harga}, {promo}. Cocok dihuni atau disewakan.",
      "Investasi sekaligus hunian di {lokasi}. Fasilitas lengkap, akses mudah. Konsultasi gratis.",
      "Tinggal di jantung {lokasi}. Unit fully furnished, {promo}. Private viewing tersedia.",
    ],
    konten: [
      "Video tour unit + fasilitas (pool, gym, lounge)",
      "Carousel hitung ROI sewa",
      "Reels view dari unit / rooftop",
    ],
  },
  apartemen_premium: {
    persona:
      "Eksekutif / investor 33–55, cari unit premium di lokasi prime, fokus prestise & capital gain.",
    umur: [33, 55],
    gender: "Semua",
    radiusKm: 25,
    interest: ["Luxury real estate", "Investasi properti", "Wealth management", "Premium lifestyle", "Hospitality / hotel"],
    exclude: ["Agen properti / Real estate agent"],
    angle: ["Lokasi prime & prestise", "Capital gain tinggi", "Layanan kelas hotel"],
    copy: [
      "Premium living di {lokasi}. Lokasi prime, layanan kelas hotel. Mulai {harga}. By appointment.",
      "Investasi premium {lokasi} — capital gain & prestise. {promo}. Private presentation tersedia.",
      "Signature residence di {lokasi}. Unit eksklusif & terbatas. Hubungi kami.",
    ],
    konten: [
      "Video sinematik gedung + skyline view",
      "Carousel spesifikasi & layanan premium",
      "Highlight prospek capital gain lokasi prime",
    ],
  },

  ruko_subsidi: {
    persona:
      "Pebisnis pemula / UMKM 25–45, cari ruko terjangkau untuk usaha atau buka cabang pertama.",
    umur: [25, 50],
    gender: "Semua",
    radiusKm: 25,
    interest: ["UMKM / wirausaha", "Bisnis kecil", "KPR komersial", "Franchise / waralaba"],
    exclude: ["Agen properti / Real estate agent"],
    angle: ["Cocok untuk usaha pemula", "Harga terjangkau & strategis", "Cicilan komersial ringan"],
    copy: [
      "Ruko strategis di {lokasi} untuk usahamu. Mulai {harga}, {promo}. Cocok buka cabang pertama!",
      "Punya tempat usaha sendiri di {lokasi}. DP {dp}, cicilan ringan. Daftar survei sekarang.",
      "Lokasi ramai = usaha lancar. Ruko {lokasi} mulai {harga}. Info unit & simulasi KPR.",
    ],
    konten: ["Reels ruko + potensi traffic area", "Carousel denah & spesifikasi", "Testimoni tenant/penyewa"],
  },
  ruko_menengah: {
    persona:
      "Pebisnis / investor 30–50, cari ruko di lokasi berkembang untuk usaha atau disewakan.",
    umur: [30, 52],
    gender: "Semua",
    radiusKm: 22,
    interest: ["Real estate investing", "Bisnis & retail", "KPR komersial", "Investasi", "Franchise / waralaba"],
    exclude: ["Agen properti / Real estate agent"],
    angle: ["Lokasi berkembang & ramai", "Potensi sewa tinggi", "Investasi komersial"],
    copy: [
      "Ruko di kawasan berkembang {lokasi}. Mulai {harga}, {promo}. Untuk usaha atau disewakan.",
      "Investasi komersial {lokasi} — potensi sewa tinggi. Konsultasi gratis.",
      "Lokasi premium untuk bisnis di {lokasi}. Unit terbatas, {promo}.",
    ],
    konten: ["Video area komersial + traffic", "Carousel hitung potensi sewa", "Highlight tenant sekitar"],
  },
  ruko_premium: {
    persona:
      "Investor / korporasi 35–55, cari ruko/komersial premium di lokasi prime untuk flagship atau aset.",
    umur: [33, 55],
    gender: "Semua",
    radiusKm: 30,
    interest: ["Commercial real estate", "Investasi properti", "Wealth management", "Bisnis korporat"],
    exclude: ["Agen properti / Real estate agent"],
    angle: ["Lokasi prime & high traffic", "Aset komersial bernilai tinggi", "Cocok flagship store"],
    copy: [
      "Komersial premium di {lokasi}, high traffic. Mulai {harga}. By appointment.",
      "Aset komersial strategis {lokasi} — nilai investasi tinggi. {promo}. Private viewing.",
      "Flagship-ready di {lokasi}. Unit eksklusif. Hubungi tim kami.",
    ],
    konten: ["Video sinematik area bisnis prime", "Carousel spesifikasi & legalitas", "Highlight prospek nilai aset"],
  },
};

export function getSegment(produk, segmenHarga) {
  return SEGMENTS[`${produk}_${segmenHarga}`] || null;
}
