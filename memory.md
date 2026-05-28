# Memory

Catatan dan konteks untuk agent agar tetap ingat antar session.

## Preferensi

- **Bahasa:** Bahasa Indonesia
- **Struktur repo:** Setiap project/eksperimen dibuatkan folder terpisah di root repo
- **Platform:** User menggunakan Cursor via mobile web
- **Berita harian:** Bisa minta digest di chat ("berita hari ini"), selain file di `daily-news/reports/`

## Tentang Repo Ini

- Repo ini (`domswp-playground`) adalah sandbox/playground untuk eksperimen dan belajar Cursor
- **GitHub Pages (public):** https://domswp.github.io/domswp-playground/
- Portfolio/pembelajaran utama user di repo lain: https://domswp.github.io/profile-domswp/ — **jangan tertimpa**
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
- **Roadmap user:** roket berikutnya mis. Electron

### iss-tracker

- **Live:** https://domswp.github.io/domswp-playground/iss-tracker/
- **Stack:** TLE + `satellite.js` (halus), API [wheretheiss.at](https://wheretheiss.at/) tiap ~45 dtk
- **UI:** panel telemetri collapsible (default tertutup)

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

## Catatan Penting

- User hobby coder — penjelasan jelas, tidak terlalu teknis
- Stack favorit: Rust, Go, Python
- Minat: retro computing, IoT, hardware, LLM
- Angka roket = perkiraan edukasi (NASA, SpaceX, Roscosmos, dll.), bukan telemetri live
