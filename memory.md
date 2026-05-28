# Memory

Catatan dan konteks untuk agent agar tetap ingat antar session.

## Preferensi

- **Bahasa:** Bahasa Indonesia
- **Struktur repo:** Setiap project/eksperimen dibuatkan folder terpisah di root repo
- **Platform:** User menggunakan Cursor via mobile web
- **Berita harian:** Bisa minta digest di chat ("berita hari ini"), selain file di `daily-news/reports/`

## Tentang Repo Ini

- Repo GitHub: `domswp-playground` — **tampilan hub:** **Lab Domas** · subtitle *Ruang eksperimen dan belajar*
- **GitHub Pages (hub):** https://domswp.github.io/domswp-playground/
- Lab = portofolio **demo online** (bukan cuma angkasa; eksperimen lain menyusul) — **bukan** mengganti portfolio utama
- Portfolio/pembelajaran utama user di repo lain: https://domswp.github.io/profile-domswp/ — **jangan tertimpa**
- **Hub hanya list proyek yang sudah deploy di Pages** (sekarang: Orbit Viewer, ISS Tracker) — `rocket-sim/`, `daily-news/` tidak perlu di hub
- Profil user: `profile.md`

## Ide & Project

| Folder | Deskripsi | Status |
|--------|-----------|--------|
| `rocket-sim/` | Belajar rocket engineering (Python, Tsiolkovsky, staging) | Selesai pemula — **jangan ubah** kecuali diminta |
| `daily-news/` | Digest berita RSS + analisis/kontradiksi | Aktif — GH Actions 07:00 WIB |
| `threejs-orbit/` | Orbit Viewer 3D + simulasi misi | Aktif — lihat bawah |
| `iss-tracker/` | ISS live 3D (TLE + satellite.js + API) | Aktif — lihat bawah |

### threejs-orbit (build terbaru)

- **Live:** https://domswp.github.io/domswp-playground/threejs-orbit/
- **Roket:** Falcon 9, Starship, Saturn V, Soyuz-2.1a, SLS Block 1
- **Simulasi:** misi LEO / GTO / TLI, kondisi normal/panas/dingin, TWR & Δv
- **UI:** panel "Simulasi misi" **collapsible** (default tertutup) — jangan menutupi roket 3D
- **Fitur:** peluncuran & staging + api, bandingkan 2 roket, klik stage = spesifikasi
- **Data:** `rocketMeta.js`, `simulation.js`, katalog `data/rockets-catalog.json`
- **Roadmap user:** roket berikutnya mis. Electron (ISS live 3D ✅ selesai di `iss-tracker/`)

### iss-tracker (berhasil — mobile & Pages)

- **Live:** https://domswp.github.io/domswp-playground/iss-tracker/
- **Status user (2026-05-28):** Sudah jalan di mobile web + GitHub Pages; posisi ISS **live** (orbit nyata, bukan simulasi fiksi)
- **Stack:** TLE + `satellite.js` (SGP4, halus tiap frame), sinkron API [wheretheiss.at](https://wheretheiss.at/) tiap ~45 dtk, refresh TLE tiap 6 jam
- **API di Pages:** Bisa pakai API luar langsung dari browser (HTTPS + CORS `*`) — bukan blocker untuk GitHub Pages
- **UI:** panel telemetri collapsible (default tertutup); tombol ikuti ISS, jalur orbit, reset kamera
- **Data:** Bukan telemetri resmi NASA — TLE + API publik, delay beberapa detik; cukup untuk edukasi / visual “ISS di mana sekarang”
- **Bug pernah:** `resizeObserver` typo → layar hitam + chip “Memuat…” stuck — diperbaiki PR #17
- **Kode utama:** `iss-tracker/src/main.js`, `issPropagation.js`, `api.js`, `earth.js`

## Keputusan

| Tanggal | Keputusan |
|---------|-----------|
| 2026-05-26 | Repo = playground, satu folder per project, Bahasa Indonesia |
| 2026-05-27 | `rocket-sim/` project pertama |
| 2026-05-27 | `daily-news/` terpisah dari rocket-sim |
| 2026-05-27 | `threejs-orbit/` — jangan ganggu rocket-sim |
| 2026-05-27 | GitHub Pages dari `/docs`, repo **public** (profile-domswp tetap terpisah) |
| 2026-05-28 | Orbit Viewer: simulasi + bandingkan + roket (Saturn V, Soyuz, SLS) |
| 2026-05-28 | Panel simulasi collapsible — area tengah untuk 3D (mobile & desktop) |
| 2026-05-28 | Footer viewer: data dari referensi online, bukan rocket-sim/ saja |
| 2026-05-28 | `iss-tracker/` — ISS live 3D (TLE + satellite.js + wheretheiss.at) |
| 2026-05-28 | ISS Tracker: deploy Pages OK; user konfirmasi live & akurat untuk visual |
| 2026-05-28 | Fix mobile: hapus bug `resizeObserver` (PR #17); TLE cadangan + timeout fetch |
| 2026-05-28 | Hub rebrand: **Lab Domas** — Ruang eksperimen dan belajar; hanya demo Pages; campur ID/EN OK |

## Catatan Penting

- User hobby coder — penjelasan jelas, tidak terlalu teknis
- Stack favorit: Rust, Go, Python
- Minat: retro computing, IoT, hardware, LLM
- Angka roket = perkiraan edukasi (NASA, SpaceX, Roscosmos, dll.), bukan telemetri live
