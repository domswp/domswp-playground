"""
04 - Falcon 9 vs Starship: Perbandingan Roket SpaceX
=====================================================

Sekarang kita bandingkan dua roket SpaceX secara langsung!
Kita juga tambahkan Saturn V sebagai referensi sejarah.

Falcon 9:
    - 2 stage, stage 1 reusable
    - Mesin Merlin (kerosene/LOX)
    - Workhorse SpaceX sejak 2010

Starship + Super Heavy:
    - 2 stage, keduanya reusable
    - Mesin Raptor (metana/LOX)
    - Roket terbesar & terkuat yang pernah dibuat

Saturn V:
    - 3 stage, tidak reusable
    - Membawa manusia ke Bulan (1969-1972)
"""

import math

# ============================================================
# KONSTANTA
# ============================================================
G0 = 9.81
R_EARTH = 6_371_000
RHO_0 = 1.225
H_SCALE = 8500

# ============================================================
# DATA ROKET
# ============================================================

ROCKETS = {
    "Falcon 9": {
        "stages": [
            {
                "nama": "Stage 1 (9x Merlin)",
                "mesin": "Merlin 1D",
                "bahan_bakar": "Kerosene/LOX",
                "jumlah_mesin": 9,
                "massa_struktur": 25_600,
                "massa_bb": 395_700,
                "thrust": 7_607_000,      # N (sea level)
                "isp_sl": 282,            # sea level
                "isp_vac": 311,           # vacuum
                "burn_time": 162,
            },
            {
                "nama": "Stage 2 (1x Merlin Vac)",
                "mesin": "Merlin 1D Vac",
                "bahan_bakar": "Kerosene/LOX",
                "jumlah_mesin": 1,
                "massa_struktur": 3_900,
                "massa_bb": 92_670,
                "thrust": 934_000,        # N (vacuum only)
                "isp_sl": 311,
                "isp_vac": 348,
                "burn_time": 397,
            },
        ],
        "payload_leo": 22_800,
        "tinggi": 70,
        "diameter": 3.7,
        "reusable": "Stage 1",
        "first_flight": 2010,
    },

    "Starship + Super Heavy": {
        "stages": [
            {
                "nama": "Super Heavy (33x Raptor)",
                "mesin": "Raptor 2",
                "bahan_bakar": "Metana/LOX",
                "jumlah_mesin": 33,
                "massa_struktur": 200_000,
                "massa_bb": 3_400_000,
                "thrust": 74_000_000,     # N (sea level)
                "isp_sl": 327,
                "isp_vac": 350,
                "burn_time": 160,
            },
            {
                "nama": "Starship (6x Raptor)",
                "mesin": "Raptor 2",
                "bahan_bakar": "Metana/LOX",
                "jumlah_mesin": 6,
                "massa_struktur": 100_000,
                "massa_bb": 1_200_000,
                "thrust": 14_700_000,     # N
                "isp_sl": 327,
                "isp_vac": 350,
                "burn_time": 360,
            },
        ],
        "payload_leo": 150_000,
        "tinggi": 121,
        "diameter": 9.0,
        "reusable": "Keduanya (booster + ship)",
        "first_flight": 2023,
    },

    "Saturn V": {
        "stages": [
            {
                "nama": "S-IC (5x F-1)",
                "mesin": "F-1",
                "bahan_bakar": "Kerosene/LOX",
                "jumlah_mesin": 5,
                "massa_struktur": 131_000,
                "massa_bb": 2_077_000,
                "thrust": 33_850_000,     # N
                "isp_sl": 263,
                "isp_vac": 263,
                "burn_time": 168,
            },
            {
                "nama": "S-II (5x J-2)",
                "mesin": "J-2",
                "bahan_bakar": "Hidrogen/LOX",
                "jumlah_mesin": 5,
                "massa_struktur": 40_000,
                "massa_bb": 444_000,
                "thrust": 5_141_000,      # N
                "isp_sl": 421,
                "isp_vac": 421,
                "burn_time": 360,
            },
            {
                "nama": "S-IVB (1x J-2)",
                "mesin": "J-2",
                "bahan_bakar": "Hidrogen/LOX",
                "jumlah_mesin": 1,
                "massa_struktur": 13_000,
                "massa_bb": 106_000,
                "thrust": 1_033_000,      # N
                "isp_sl": 421,
                "isp_vac": 421,
                "burn_time": 500,
            },
        ],
        "payload_leo": 140_000,
        "tinggi": 111,
        "diameter": 10.1,
        "reusable": "Tidak (sekali pakai)",
        "first_flight": 1967,
    },
}


# ============================================================
# FUNGSI
# ============================================================

def hitung_delta_v(isp, massa_awal, massa_akhir):
    """Hitung delta-v dengan persamaan Tsiolkovsky."""
    return isp * G0 * math.log(massa_awal / massa_akhir)


def analisis_roket(nama, data):
    """Analisis lengkap satu roket."""
    stages = data["stages"]
    payload = data["payload_leo"]

    massa_total = payload
    for s in stages:
        massa_total += s["massa_struktur"] + s["massa_bb"]

    thrust_total = stages[0]["thrust"]
    twr = thrust_total / (massa_total * G0)

    total_dv = 0
    stage_results = []

    for i, stage in enumerate(stages):
        upper_mass = payload
        for j in range(i + 1, len(stages)):
            upper_mass += stages[j]["massa_struktur"] + stages[j]["massa_bb"]

        m0 = upper_mass + stage["massa_struktur"] + stage["massa_bb"]
        mf = upper_mass + stage["massa_struktur"]

        isp = stage["isp_vac"] if i > 0 else (stage["isp_sl"] + stage["isp_vac"]) / 2
        dv = hitung_delta_v(isp, m0, mf)
        total_dv += dv

        stage_results.append({
            "nama": stage["nama"],
            "mesin": stage["mesin"],
            "bahan_bakar": stage["bahan_bakar"],
            "m0": m0,
            "mf": mf,
            "dv": dv,
            "isp": isp,
            "thrust": stage["thrust"],
        })

    return {
        "nama": nama,
        "massa_total": massa_total,
        "thrust_total": thrust_total,
        "twr": twr,
        "total_dv": total_dv,
        "payload": payload,
        "stages": stage_results,
        "meta": data,
    }


def gravitasi(ketinggian):
    return G0 * (R_EARTH / (R_EARTH + ketinggian)) ** 2


def kepadatan_udara(ketinggian):
    if ketinggian > 100_000:
        return 0.0
    return RHO_0 * math.exp(-ketinggian / H_SCALE)


def simulasi_peluncuran(nama, data, dt=0.5):
    """Simulasi peluncuran 1D untuk roket multi-stage."""
    stages = data["stages"]
    payload = data["payload_leo"]
    diameter = data["diameter"]
    area = math.pi * (diameter / 2) ** 2
    cd = 0.3

    massa_total = payload
    for s in stages:
        massa_total += s["massa_struktur"] + s["massa_bb"]

    stage_bb = [s["massa_bb"] for s in stages]
    current_stage = 0

    ketinggian = 0.0
    kecepatan = 0.0
    waktu = 0.0

    log = {"waktu": [], "ketinggian": [], "kecepatan": []}

    while waktu < 600 and current_stage < len(stages):
        g = gravitasi(ketinggian)
        rho = kepadatan_udara(ketinggian)
        gaya_drag = 0.5 * rho * kecepatan ** 2 * cd * area

        stage = stages[current_stage]

        if stage_bb[current_stage] > 0:
            burn_rate = stage["massa_bb"] / stage["burn_time"]
            consumed = min(burn_rate * dt, stage_bb[current_stage])
            stage_bb[current_stage] -= consumed
            massa_total -= consumed

            frac = ketinggian / 100_000
            frac = min(max(frac, 0), 1)
            isp = stage["isp_sl"] + (stage["isp_vac"] - stage["isp_sl"]) * frac
            gaya_thrust = stage["thrust"]
        else:
            gaya_thrust = 0
            massa_total -= stage["massa_struktur"]

            current_stage += 1
            if current_stage < len(stages):
                continue
            else:
                break

        berat = massa_total * g
        gaya_net = gaya_thrust - berat - gaya_drag
        percepatan = gaya_net / massa_total

        kecepatan += percepatan * dt
        ketinggian += kecepatan * dt
        waktu += dt

        if ketinggian < 0:
            ketinggian = 0

        log["waktu"].append(waktu)
        log["ketinggian"].append(ketinggian)
        log["kecepatan"].append(kecepatan)

    return log


# ============================================================
# TAMPILKAN PERBANDINGAN
# ============================================================

def tampilkan_spesifikasi():
    """Tampilkan tabel perbandingan spesifikasi."""

    print("=" * 70)
    print("📋 SPESIFIKASI ROKET")
    print("=" * 70)

    for nama, data in ROCKETS.items():
        result = analisis_roket(nama, data)

        print(f"\n  {'─' * 60}")
        print(f"  🚀 {nama}")
        print(f"  {'─' * 60}")
        print(f"  Tinggi        : {data['tinggi']} m")
        print(f"  Diameter      : {data['diameter']} m")
        print(f"  Massa total   : {result['massa_total']:>12,} kg ({result['massa_total']/1000:,.0f} ton)")
        print(f"  Payload (LEO) : {data['payload_leo']:>12,} kg ({data['payload_leo']/1000:,.0f} ton)")
        print(f"  Thrust (liftoff): {result['thrust_total']:>10,} N ({result['thrust_total']/1e6:.1f} MN)")
        print(f"  TWR           : {result['twr']:>12.2f}")
        print(f"  Reusable      : {data['reusable']}")
        print(f"  First flight  : {data['first_flight']}")

        print(f"\n  Stages:")
        for s in result["stages"]:
            print(f"    {s['nama']:<30} Isp={s['isp']:.0f}s  Δv={s['dv']:>7,.0f} m/s  [{s['bahan_bakar']}]")
        print(f"    {'TOTAL Δv':<30}          {result['total_dv']:>7,.0f} m/s ({result['total_dv']/1000:.1f} km/s)")


def tampilkan_head_to_head():
    """Tabel head-to-head comparison."""

    print("\n\n" + "=" * 70)
    print("⚔️  HEAD-TO-HEAD COMPARISON")
    print("=" * 70)

    results = {nama: analisis_roket(nama, data) for nama, data in ROCKETS.items()}

    metrics = [
        ("Tinggi (m)", lambda r: r["meta"]["tinggi"], "{:.0f}"),
        ("Massa (ton)", lambda r: r["massa_total"] / 1000, "{:,.0f}"),
        ("Thrust (MN)", lambda r: r["thrust_total"] / 1e6, "{:.1f}"),
        ("TWR", lambda r: r["twr"], "{:.2f}"),
        ("Payload LEO (ton)", lambda r: r["payload"] / 1000, "{:.1f}"),
        ("Total Δv (km/s)", lambda r: r["total_dv"] / 1000, "{:.1f}"),
        ("Jumlah Stage", lambda r: len(r["stages"]), "{:.0f}"),
        ("First Flight", lambda r: r["meta"]["first_flight"], "{:.0f}"),
    ]

    names = list(results.keys())
    print(f"\n  {'Metrik':<22}", end="")
    for n in names:
        label = "Starship" if "Starship" in n else n
        print(f" {label:>14}", end="")
    print()
    print(f"  {'─' * 22}", end="")
    for _ in names:
        print(f" {'─' * 14}", end="")
    print()

    for label, fn, fmt in metrics:
        print(f"  {label:<22}", end="")
        values = []
        for n in names:
            val = fn(results[n])
            values.append(val)
            print(f" {fmt.format(val):>14}", end="")
        print()

    print(f"\n  💡 Insight:")
    print(f"     - Starship thrust = {results['Starship + Super Heavy']['thrust_total']/results['Falcon 9']['thrust_total']:.0f}x Falcon 9!")
    print(f"     - Starship payload = {results['Starship + Super Heavy']['payload']/results['Falcon 9']['payload']:.0f}x Falcon 9!")
    print(f"     - Starship massa = {results['Starship + Super Heavy']['massa_total']/results['Falcon 9']['massa_total']:.0f}x Falcon 9!")
    print(f"     - Tapi cost per kg ke orbit JAUH lebih murah karena fully reusable")


def tampilkan_efisiensi_bahan_bakar():
    """Bandingkan efisiensi bahan bakar tiap roket."""

    print("\n\n" + "=" * 70)
    print("⛽ EFISIENSI BAHAN BAKAR")
    print("=" * 70)

    print(f"\n  Berapa kg bahan bakar per 1 kg payload ke LEO?\n")
    print(f"  {'Roket':<28} {'BB Total (ton)':>14} {'Payload (ton)':>14} {'Rasio BB:Payload':>18}")
    print(f"  {'─' * 76}")

    for nama, data in ROCKETS.items():
        total_bb = sum(s["massa_bb"] for s in data["stages"])
        payload = data["payload_leo"]
        rasio = total_bb / payload

        label = "Starship" if "Starship" in nama else nama
        print(f"  {label:<28} {total_bb/1000:>14,.0f} {payload/1000:>14,.1f} {rasio:>14.0f}x")

    print(f"\n  💡 Insight:")
    print(f"     - Semua roket butuh puluhan kali lipat BB dibanding payload")
    print(f"     - Ini karena 'tyranny of the rocket equation'")
    print(f"     - Yang bikin Starship murah bukan efisiensi BB, tapi REUSABILITY")
    print(f"     - Falcon 9 stage 1 landing & terbang lagi → hemat ~60% biaya")
    print(f"     - Starship keduanya reusable → potensial hemat ~90%+ biaya")


def tampilkan_kenapa_metana():
    """Jelaskan kenapa SpaceX pindah ke metana."""

    print("\n\n" + "=" * 70)
    print("🔬 KENAPA STARSHIP PAKAI METANA?")
    print("=" * 70)

    print("""
  Falcon 9 pakai KEROSENE (RP-1), Starship pakai METANA (CH₄).
  Kenapa ganti?

  ┌─────────────────┬──────────────────┬──────────────────┐
  │ Aspek           │ Kerosene (RP-1)  │ Metana (CH₄)     │
  ├─────────────────┼──────────────────┼──────────────────┤
  │ Isp (sea level) │ ~282 s           │ ~327 s (+16%)    │
  │ Isp (vacuum)    │ ~311 s           │ ~350 s (+13%)    │
  │ Jelaga/kerak    │ Banyak (kotor)   │ Hampir tidak ada │
  │ Reusability     │ Perlu dibersihkan│ Tinggal isi ulang│
  │ Harga           │ Mahal            │ Murah (gas alam) │
  │ Di Mars?        │ ❌ Tidak tersedia │ ✅ Bisa dibuat!   │
  │ Densitas        │ Tinggi (tangki  │ Rendah (tangki   │
  │                 │ lebih kecil)     │ lebih besar)     │
  └─────────────────┴──────────────────┴──────────────────┘

  🔑 Alasan utama: MARS!

  Atmosfer Mars = 95% CO₂
  Es di Mars    = H₂O

  Reaksi Sabatier:
      CO₂ + 4H₂ → CH₄ + 2H₂O

  Artinya Starship bisa "isi bensin" di Mars untuk pulang ke Bumi!
  Ini adalah kunci dari rencana Elon Musk untuk kolonisasi Mars.
""")


# ============================================================
# VISUALISASI
# ============================================================

def buat_grafik():
    """Buat grafik perbandingan + simulasi peluncuran."""

    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import numpy as np

    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle('Falcon 9 vs Starship vs Saturn V', fontsize=18, fontweight='bold')

    colors = {
        "Falcon 9": "#1E88E5",
        "Starship + Super Heavy": "#E53935",
        "Saturn V": "#FFA726",
    }

    # --- 1. Bar chart: Spesifikasi ---
    ax1 = axes[0][0]
    names_short = ["Falcon 9", "Starship", "Saturn V"]
    massa = [ROCKETS[n]["stages"][0]["thrust"] / 1e6 +
             sum(s["thrust"] for s in ROCKETS[n]["stages"][1:]) / 1e6
             if n != "Starship + Super Heavy" else 74.0
             for n in ROCKETS.keys()]

    thrust_vals = []
    for nama, data in ROCKETS.items():
        thrust_vals.append(data["stages"][0]["thrust"] / 1e6)

    x = np.arange(3)
    bars = ax1.bar(x, thrust_vals, color=[colors[n] for n in ROCKETS.keys()],
                   edgecolor='white', linewidth=2)
    for bar, val in zip(bars, thrust_vals):
        ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
                f'{val:.0f} MN', ha='center', fontsize=11, fontweight='bold')
    ax1.set_xticks(x)
    ax1.set_xticklabels(names_short)
    ax1.set_ylabel('Thrust Liftoff (MN)')
    ax1.set_title('Thrust saat Liftoff')
    ax1.grid(True, alpha=0.3, axis='y')

    # --- 2. Bar chart: Payload ---
    ax2 = axes[0][1]
    payloads = [d["payload_leo"] / 1000 for d in ROCKETS.values()]
    bars = ax2.bar(x, payloads, color=[colors[n] for n in ROCKETS.keys()],
                   edgecolor='white', linewidth=2)
    for bar, val in zip(bars, payloads):
        ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                f'{val:.0f} ton', ha='center', fontsize=11, fontweight='bold')
    ax2.set_xticks(x)
    ax2.set_xticklabels(names_short)
    ax2.set_ylabel('Payload ke LEO (ton)')
    ax2.set_title('Kapasitas Payload ke LEO')
    ax2.grid(True, alpha=0.3, axis='y')

    # --- 3. Simulasi peluncuran: Ketinggian ---
    ax3 = axes[1][0]
    for nama, data in ROCKETS.items():
        log = simulasi_peluncuran(nama, data)
        label = "Starship" if "Starship" in nama else nama
        ax3.plot(log["waktu"], [h/1000 for h in log["ketinggian"]],
                label=label, color=colors[nama], linewidth=2)

    ax3.axhline(y=100, color='gray', linestyle='--', alpha=0.5, label='Karman Line')
    ax3.set_xlabel('Waktu (s)')
    ax3.set_ylabel('Ketinggian (km)')
    ax3.set_title('Simulasi Peluncuran: Ketinggian')
    ax3.legend(fontsize=9)
    ax3.grid(True, alpha=0.3)

    # --- 4. Simulasi peluncuran: Kecepatan ---
    ax4 = axes[1][1]
    for nama, data in ROCKETS.items():
        log = simulasi_peluncuran(nama, data)
        label = "Starship" if "Starship" in nama else nama
        ax4.plot(log["waktu"], [v/1000 for v in log["kecepatan"]],
                label=label, color=colors[nama], linewidth=2)

    ax4.axhline(y=7.8, color='gray', linestyle='--', alpha=0.5, label='Orbital velocity')
    ax4.set_xlabel('Waktu (s)')
    ax4.set_ylabel('Kecepatan (km/s)')
    ax4.set_title('Simulasi Peluncuran: Kecepatan')
    ax4.legend(fontsize=9)
    ax4.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig('rocket-sim/04_falcon9_vs_starship.png', dpi=150)
    print(f"\n  📈 Grafik disimpan: rocket-sim/04_falcon9_vs_starship.png")


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    print("\n" + "🚀" * 30)
    print("  FALCON 9 vs STARSHIP vs SATURN V")
    print("🚀" * 30)

    tampilkan_spesifikasi()
    tampilkan_head_to_head()
    tampilkan_efisiensi_bahan_bakar()
    tampilkan_kenapa_metana()
    buat_grafik()

    print("\n" + "=" * 70)
    print("📚 RANGKUMAN")
    print("=" * 70)
    print("""
  1. Falcon 9  = workhorse SpaceX, kerosene, stage 1 reusable
  2. Starship  = roket terbesar, metana, fully reusable
  3. Saturn V  = legenda Apollo, kerosene+hidrogen, sekali pakai
  4. Metana dipilih karena: lebih efisien, lebih bersih, bisa dibuat di Mars
  5. Reusability adalah kunci untuk menurunkan biaya akses ke orbit

  🎉 Sekarang kamu tahu perbedaan roket-roket SpaceX!
""")
