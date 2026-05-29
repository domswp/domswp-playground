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
| `snake-rust/` | Game Snake — engine Rust → WASM | Aktif — demo Pages, lihat bawah |
| `meta-ads-planner/` | Estimasi Meta Ads + targeting properti | Aktif — internal PP, lihat bawah |

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

### snake-rust (demo live Rust pertama)

- **Live:** https://domswp.github.io/domswp-playground/snake-rust/
- **Konsep:** Bukti bahwa **Rust bisa demo live di GitHub Pages** lewat **WebAssembly**
- **Arsitektur:** Engine game **murni Rust** (`src/lib.rs`, `cdylib`, **tanpa wasm-bindgen** karena Cargo 1.83 belum dukung edition2024 untuk wasm-bindgen-cli baru) → C-ABI exports; `main.js` baca grid dari memori linear WASM, gambar ke canvas, simpan rekor di `localStorage`
- **Fitur:** skor + skor terbaik, panah/WASD/swipe/tombol d-pad, restart, game over overlay
- **Build:** `snake-rust/build.sh [out]` → butuh `rustup target add wasm32-unknown-unknown`; workflow Pages build ulang otomatis
- **Catatan:** WASM ~20 KB; pola ini bisa dipakai ulang untuk demo Rust/Go (WASM) lain di Lab Domas
- **Pengembangan ke depan (ide):**
  - Level kesulitan / kecepatan naik seiring skor (tick makin cepat)
  - Pilihan ukuran grid + mode "wrap" (tembus dinding) vs "wall"
  - Obstacle/rintangan, power-up, atau multi-food
  - High-score persisten + (opsional) leaderboard
  - Suara/efek, animasi makan, tema warna
  - Touch/swipe diperhalus untuk mobile; mungkin haptic
  - Eksperimen lanjut: porting logic ke wasm-bindgen kalau toolchain sudah mendukung, atau coba render via Rust+WebGL

### meta-ads-planner (tool internal PP Properti)

- **Live:** https://domswp.github.io/domswp-playground/meta-ads-planner/
- **Tujuan:** Estimasi leads & CPL kampanye Meta Ads + rekomendasi targeting/copy/konten untuk produk properti
- **Untuk:** Internal PP Properti (Domas: Corporate Performance). Cakupan **Meta saja**.
- **Keputusan desain user:** (1) **Funnel mode** (CPM+CTR+CPL, CVR diturunkan), (2) **funnel hilir wajib diisi** (lead→janji temu→site visit→booking), (3) **tanpa AI dulu** — AI = nilai tambah v2
- **Kalibrasi:** user input CPM/CTR/CPL data lama → baseline `localStorage`; estimasi keluar rentang pesimis/ekspektasi/optimis
- **Targeting rule-based:** `js/segments.js` (produk×segmen harga = 9 preset CONTOH, user sesuaikan). Persona, interest, umur/radius, copy template (slot {lokasi}{harga}{dp}{promo}), ide konten
- **Warning:** konsistensi CVR (>100% error), learning phase (<50 leads/mgg), diagnostik CTR/CVR vs benchmark
- **Stack:** HTML/JS statis murni (no build, no key) — pola Lab Domas
- **Sudah jadi (v1, 2026-05-29):** kalibrasi CPM/CTR/CPL + baseline localStorage; estimasi leads (rentang) + CPL; funnel media; funnel hilir → biaya per booking; skenario budget (0,5×/1×/2×); peringatan konsistensi/learning phase/diagnostik; targeting rule-based 9 preset; copy klik-untuk-salin. PR #21.
- **Pengembangan ke depan (roadmap):**
  - **v2 — AI (nilai tambah):** persona/copy/ide konten dinamis dari deskripsi produk (LLM). Perlu backend kecil (Go/Python) atau lokal untuk simpan API key — JANGAN taруh key di front-end
  - **Kalibrasi lebih pintar:** banyak baseline + pembobotan recency; rata-rata per produk/area; import CSV data kampanye
  - **Akurasi model:** kurva diminishing returns (audiens kecil + budget besar → CPM naik); rentang berbasis variasi historis, bukan multiplier tetap
  - **Output:** export PDF/laporan untuk meeting; bandingkan beberapa skenario berdampingan; grafik
  - **Targeting:** preset disesuaikan ke proyek PP Properti asli (nama, harga, interest spesifik); editor preset via UI (bukan edit file)
  - **v3 — Meta Marketing API:** ambil reach/audience size & estimasi hasil RESMI (butuh business verification + app review + access tier); validasi interest id via Targeting Search
  - **Lain:** multi-channel (Google/TikTok) jika dibutuhkan; mode lead-quality (lead→SQL) lebih detail
- **Catatan penting:** Interest = SARAN, validasi di Ads Manager (taksonomi Meta sering berubah). Semua angka = estimasi perencanaan, bukan garansi.

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
| 2026-05-29 | `snake-rust/` — demo live Rust→WASM (Snake + skor); cara Rust/Go tampil di Pages |
| 2026-05-29 | `meta-ads-planner/` — tool internal PP: estimasi leads Meta + targeting properti, funnel + hilir wajib, tanpa AI (v1) |

## Catatan Penting

- User hobby coder — penjelasan jelas, tidak terlalu teknis
- Stack favorit: Rust, Go, Python
- Minat: retro computing, IoT, hardware, LLM
- Angka roket = perkiraan edukasi (NASA, SpaceX, Roscosmos, dll.), bukan telemetri live
