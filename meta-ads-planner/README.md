# Meta Ads Planner — Properti

Tool internal (PP Properti) untuk **memperkirakan leads & biaya** kampanye Meta Ads dan memberi
**rekomendasi targeting + copy + ide konten** untuk produk properti. 100% client-side, jalan di
GitHub Pages. **Estimasi perencanaan, bukan garansi.**

## Cara kerja

1. **Kalibrasi** — masukkan CPM, CTR, CPL dari kampanye lama. Tiga angka ini cukup untuk
   merekonstruksi funnel (CVR klik→lead diturunkan: `CVR = (CPM/1000/CTR) / CPL`). Bisa disimpan
   sebagai baseline (`localStorage`).
2. **Simulasi** — isi budget, durasi, produk, segmen harga, lokasi, dan **funnel hilir wajib**
   (lead → janji temu → site visit → booking).
3. **Hasil** — estimasi leads (rentang pesimis/ekspektasi/optimis), CPL, funnel media, funnel hilir
   + biaya per booking, skenario budget, dan peringatan (konsistensi data, learning phase, dll.).
4. **Targeting** — rule-based dari preset `js/segments.js`: persona, interest, setting umur/radius,
   copy, ide konten.

## Menyesuaikan preset

Edit `js/segments.js`. Kunci preset = `${produk}_${segmenHarga}`
(`rumah|apartemen|ruko` × `subsidi|menengah|premium`). Slot copy: `{lokasi} {harga} {dp} {promo}`.

## Jalankan lokal

```bash
cd meta-ads-planner
python3 -m http.server 8000
# buka http://localhost:8000
```

Tidak ada build step. Untuk Pages, file disalin apa adanya ke `docs/meta-ads-planner/`.

## Roadmap

- v1 (ini): kalkulator + funnel hilir + targeting rule-based
- v2: lapisan AI (persona/copy/konten dinamis) — butuh backend untuk simpan API key
- v3: export PDF, multi-baseline berbobot, integrasi Meta Marketing API (reach resmi)
