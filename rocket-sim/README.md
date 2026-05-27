# Rocket Simulator - Belajar Rocket Engineering dari Dasar

Kumpulan script Python untuk belajar dasar-dasar fisika roket secara interaktif.

## Konsep Dasar

### Bagaimana Roket Bekerja?

Roket bekerja berdasarkan **Hukum Newton ke-3**: setiap aksi punya reaksi yang sama dan berlawanan arah. Gas panas dikeluarkan ke bawah → roket terdorong ke atas.

```
        🔺  ← Roket naik
        |
       /|\
      / | \
     /  |  \
    /  🔥  \  ← Gas dikeluarkan ke bawah
```

### Istilah Penting

| Istilah | Arti | Satuan |
|---------|------|--------|
| **Thrust** | Gaya dorong mesin roket | Newton (N) |
| **Mass** | Massa total roket (struktur + bahan bakar) | Kilogram (kg) |
| **Specific Impulse (Isp)** | Efisiensi mesin roket — makin tinggi makin irit | Detik (s) |
| **Delta-v (Δv)** | Total perubahan kecepatan yang bisa dicapai | m/s |
| **TWR** | Thrust-to-Weight Ratio — harus > 1 supaya bisa lepas landas | - |
| **Drag** | Hambatan udara | Newton (N) |
| **Staging** | Membuang bagian roket yang sudah kosong untuk mengurangi massa | - |

## Daftar Script

| No | File | Topik | Apa yang Dipelajari |
|----|------|-------|---------------------|
| 01 | `01_tsiolkovsky.py` | Persamaan Tsiolkovsky | Persamaan paling fundamental — menghitung delta-v roket |
| 02 | `02_launch_sim.py` | Simulasi Peluncuran | Simulasi 1D: roket meluncur dari Bumi, ada gravity & drag |
| 03 | `03_staging.py` | Staging | Kenapa roket punya beberapa tingkat & seberapa besar bedanya |
| 04 | `04_falcon9_vs_starship.py` | Falcon 9 vs Starship | Perbandingan roket SpaceX + Saturn V, simulasi peluncuran |

## Cara Menjalankan

```bash
cd rocket-sim
pip install -r requirements.txt
python3 01_tsiolkovsky.py
python3 02_launch_sim.py
python3 03_staging.py
python3 04_falcon9_vs_starship.py
```

Setiap script menghasilkan output di terminal + grafik visualisasi (disimpan sebagai file PNG).

## Referensi Belajar

- [NASA: Rocket Principles](https://www.grc.nasa.gov/www/k-12/rocket/rktprs.html)
- [Everyday Astronaut: Rocket Science](https://everydayastronaut.com/)
- [Wikipedia: Tsiolkovsky Rocket Equation](https://en.wikipedia.org/wiki/Tsiolkovsky_rocket_equation)
