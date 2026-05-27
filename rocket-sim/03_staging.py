"""
03 - Staging: Kenapa Roket Punya Beberapa Tingkat?
===================================================

Masalah besar rocket engineering:
    Tangki kosong itu BEBAN MATI.

Setelah bahan bakar habis, tangki & mesin stage pertama
jadi massa yang tidak berguna — tapi tetap harus dibawa.
Ini membuang delta-v!

Solusi: STAGING — buang bagian yang sudah kosong.

Analogi sederhana:
    Bayangkan kamu mendaki gunung bawa 3 ransel.
    Setelah ransel pertama kosong, kamu buang → jadi lebih ringan!
    Lebih ringan = lebih cepat = lebih hemat energi.

Roket terkenal dan staging-nya:
    - Saturn V (Apollo)     : 3 stage
    - Falcon 9 (SpaceX)    : 2 stage
    - Electron (RocketLab)  : 2 stage
"""

import math

# ============================================================
# KONSTANTA
# ============================================================
G0 = 9.81

# ============================================================
# FUNGSI
# ============================================================

def delta_v_single_stage(isp, massa_payload, massa_struktur, massa_bb):
    """Hitung delta-v untuk single stage rocket."""
    m0 = massa_payload + massa_struktur + massa_bb
    mf = massa_payload + massa_struktur
    return isp * G0 * math.log(m0 / mf)


def delta_v_multi_stage(stages, massa_payload):
    """
    Hitung delta-v untuk multi-stage rocket.

    stages = list of dicts, tiap dict punya:
        - massa_struktur: kg
        - massa_bb: kg
        - isp: detik

    Stage pertama = paling bawah (terbakar duluan)
    """
    total_dv = 0.0
    stage_results = []

    remaining_payload = massa_payload
    for i, stage in enumerate(stages):
        upper_mass = remaining_payload
        for j in range(i + 1, len(stages)):
            upper_mass += stages[j]["massa_struktur"] + stages[j]["massa_bb"]

        m0 = upper_mass + stage["massa_struktur"] + stage["massa_bb"]
        mf = upper_mass + stage["massa_struktur"]

        dv = stage["isp"] * G0 * math.log(m0 / mf)
        total_dv += dv

        stage_results.append({
            "stage": i + 1,
            "m0": m0,
            "mf": mf,
            "dv": dv,
            "isp": stage["isp"],
            "massa_struktur": stage["massa_struktur"],
            "massa_bb": stage["massa_bb"],
        })

    return total_dv, stage_results


# ============================================================
# CONTOH 1: Single Stage vs Two Stage
# ============================================================

def single_vs_two_stage():
    """Bandingkan single stage vs two stage dengan total massa sama."""

    print("=" * 60)
    print("🚀 CONTOH 1: Single Stage vs Two Stage")
    print("=" * 60)

    massa_payload = 1_000  # kg
    isp = 311  # detik (sama untuk semua)

    # --- Single Stage ---
    massa_struktur_total = 10_000  # kg
    massa_bb_total = 200_000       # kg

    dv_single = delta_v_single_stage(isp, massa_payload, massa_struktur_total, massa_bb_total)

    print(f"\n  📦 Payload: {massa_payload:,} kg")
    print(f"  🔧 Total struktur: {massa_struktur_total:,} kg")
    print(f"  ⛽ Total bahan bakar: {massa_bb_total:,} kg")

    print(f"\n  --- Single Stage ---")
    print(f"  Massa awal  : {massa_payload + massa_struktur_total + massa_bb_total:>10,} kg")
    print(f"  Delta-v     : {dv_single:>10,.0f} m/s ({dv_single/1000:.2f} km/s)")

    # --- Two Stage (bagi rata) ---
    stages = [
        {"massa_struktur": 7_000, "massa_bb": 150_000, "isp": isp},
        {"massa_struktur": 3_000, "massa_bb": 50_000, "isp": isp},
    ]

    dv_two, results = delta_v_multi_stage(stages, massa_payload)

    print(f"\n  --- Two Stage ---")
    for r in results:
        print(f"  Stage {r['stage']}: struktur={r['massa_struktur']:,}kg, "
              f"BB={r['massa_bb']:,}kg, Δv={r['dv']:,.0f} m/s")
    print(f"  Total Delta-v: {dv_two:>10,.0f} m/s ({dv_two/1000:.2f} km/s)")

    keuntungan = dv_two - dv_single
    persen = (keuntungan / dv_single) * 100

    print(f"\n  📊 Perbandingan:")
    print(f"     Single stage : {dv_single:,.0f} m/s")
    print(f"     Two stage    : {dv_two:,.0f} m/s")
    print(f"     Keuntungan   : +{keuntungan:,.0f} m/s (+{persen:.1f}%)")
    print(f"\n  💡 Dengan massa total yang SAMA, staging memberikan")
    print(f"     {persen:.1f}% lebih banyak delta-v!")

    return dv_single, dv_two


# ============================================================
# CONTOH 2: Simulasi Saturn V (Apollo)
# ============================================================

def simulasi_saturn_v():
    """Simulasi staging Saturn V yang membawa manusia ke Bulan."""

    print("\n" + "=" * 60)
    print("🌙 CONTOH 2: Saturn V — Roket ke Bulan")
    print("=" * 60)

    massa_payload = 45_000  # kg (Apollo spacecraft)

    stages = [
        {
            "nama": "S-IC (Stage 1)",
            "mesin": "5x F-1",
            "bahan_bakar": "Kerosene/LOX",
            "massa_struktur": 131_000,
            "massa_bb": 2_077_000,
            "isp": 263,
        },
        {
            "nama": "S-II (Stage 2)",
            "mesin": "5x J-2",
            "bahan_bakar": "Hydrogen/LOX",
            "massa_struktur": 40_000,
            "massa_bb": 444_000,
            "isp": 421,
        },
        {
            "nama": "S-IVB (Stage 3)",
            "mesin": "1x J-2",
            "bahan_bakar": "Hydrogen/LOX",
            "massa_struktur": 13_000,
            "massa_bb": 106_000,
            "isp": 421,
        },
    ]

    print(f"\n  Payload (Apollo spacecraft): {massa_payload:,} kg")

    total_massa = massa_payload
    for s in stages:
        total_massa += s["massa_struktur"] + s["massa_bb"]
    print(f"  Massa total saat liftoff   : {total_massa:,} kg ({total_massa/1000:,.0f} ton)")

    stage_dicts = [{"massa_struktur": s["massa_struktur"],
                     "massa_bb": s["massa_bb"],
                     "isp": s["isp"]} for s in stages]

    dv_total, results = delta_v_multi_stage(stage_dicts, massa_payload)

    print(f"\n  {'Stage':<20} {'Mesin':<10} {'BB':<16} {'Isp':>5} {'Δv (m/s)':>10}")
    print(f"  {'-' * 65}")

    for s, r in zip(stages, results):
        print(f"  {s['nama']:<20} {s['mesin']:<10} {s['bahan_bakar']:<16} {s['isp']:>5} {r['dv']:>10,.0f}")

    print(f"  {'-' * 65}")
    print(f"  {'TOTAL':<20} {'':<10} {'':<16} {'':>5} {dv_total:>10,.0f}")

    print(f"\n  📊 Analisis:")
    print(f"     Total Δv      : {dv_total:,.0f} m/s ({dv_total/1000:.2f} km/s)")
    print(f"     Butuh ke LEO  : ~9,400 m/s")
    print(f"     Butuh ke Bulan: ~12,000 m/s (termasuk TLI)")

    if dv_total >= 12000:
        print(f"     ✅ Cukup untuk ke Bulan! ({dv_total - 12000:,.0f} m/s margin)")
    else:
        print(f"     ❌ Kurang {12000 - dv_total:,.0f} m/s untuk ke Bulan")

    dv_single = delta_v_single_stage(
        300,  # rata-rata Isp
        massa_payload,
        sum(s["massa_struktur"] for s in stages),
        sum(s["massa_bb"] for s in stages),
    )
    print(f"\n  💡 Kalau Saturn V single stage (Isp rata-rata 300s):")
    print(f"     Δv = {dv_single:,.0f} m/s — {'cukup' if dv_single >= 12000 else 'TIDAK cukup'}!")
    print(f"     Staging menambah {dv_total - dv_single:,.0f} m/s (+{(dv_total - dv_single)/dv_single*100:.0f}%)")

    return dv_total, results


# ============================================================
# CONTOH 3: Optimal Staging
# ============================================================

def optimal_staging():
    """Cari jumlah stage optimal untuk misi tertentu."""

    print("\n" + "=" * 60)
    print("🔬 CONTOH 3: Berapa Stage yang Optimal?")
    print("=" * 60)

    massa_payload = 5_000  # kg
    total_massa_bb = 500_000  # kg
    structural_fraction = 0.08  # 8% dari stage mass adalah struktur
    isp = 311  # detik

    print(f"\n  Payload          : {massa_payload:,} kg")
    print(f"  Total bahan bakar: {total_massa_bb:,} kg")
    print(f"  Structural frac  : {structural_fraction*100:.0f}%")
    print(f"  Isp              : {isp} s")

    print(f"\n  {'Jumlah Stage':>14} {'Total Δv (m/s)':>16} {'Δv (km/s)':>12} {'Bonus vs 1-stage':>18}")
    print(f"  {'-' * 64}")

    results = []
    dv_baseline = None

    for n_stages in range(1, 7):
        bb_per_stage = total_massa_bb / n_stages

        stages = []
        for _ in range(n_stages):
            stage_total = bb_per_stage / (1 - structural_fraction)
            massa_struktur = stage_total * structural_fraction
            stages.append({
                "massa_struktur": massa_struktur,
                "massa_bb": bb_per_stage,
                "isp": isp,
            })

        dv_total, _ = delta_v_multi_stage(stages, massa_payload)

        if dv_baseline is None:
            dv_baseline = dv_total
            bonus = "-"
        else:
            bonus = f"+{dv_total - dv_baseline:,.0f} (+{(dv_total - dv_baseline)/dv_baseline*100:.1f}%)"

        results.append((n_stages, dv_total))
        print(f"  {n_stages:>14} {dv_total:>16,.0f} {dv_total/1000:>12.2f} {bonus:>18}")

    print(f"\n  💡 Insight:")
    print(f"     - Staging SELALU menambah delta-v")
    print(f"     - Tapi keuntungan per tambahan stage MENURUN (diminishing returns)")
    print(f"     - Dalam praktik, 2-3 stage sudah optimal")
    print(f"     - Lebih banyak stage = lebih kompleks = lebih banyak yang bisa gagal")
    print(f"     - Falcon 9 pakai 2 stage, Saturn V pakai 3 stage")

    return results


# ============================================================
# VISUALISASI
# ============================================================

def buat_grafik(saturn_results, optimal_results):
    """Buat grafik staging analysis."""

    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt

    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    fig.suptitle('Staging Analysis', fontsize=16, fontweight='bold')

    # Saturn V stage breakdown
    ax1 = axes[0]
    stage_names = [f"Stage {r['stage']}" for r in saturn_results]
    dvs = [r["dv"] / 1000 for r in saturn_results]
    colors = ['#e74c3c', '#f39c12', '#2ecc71']

    bars = ax1.bar(stage_names, dvs, color=colors, edgecolor='white', linewidth=2)
    for bar, dv in zip(bars, dvs):
        ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1,
                f'{dv:.1f} km/s', ha='center', fontsize=11, fontweight='bold')

    ax1.set_ylabel('Delta-v (km/s)')
    ax1.set_title('Saturn V — Delta-v per Stage')
    ax1.grid(True, alpha=0.3, axis='y')

    # Optimal staging
    ax2 = axes[1]
    n_stages = [r[0] for r in optimal_results]
    total_dvs = [r[1] / 1000 for r in optimal_results]

    ax2.plot(n_stages, total_dvs, 'o-', color='#3498db', linewidth=2, markersize=8)
    ax2.set_xlabel('Jumlah Stage')
    ax2.set_ylabel('Total Delta-v (km/s)')
    ax2.set_title('Delta-v vs Jumlah Stage')
    ax2.grid(True, alpha=0.3)
    ax2.set_xticks(n_stages)

    for x, y in zip(n_stages, total_dvs):
        ax2.annotate(f'{y:.1f}', (x, y), textcoords="offset points",
                    xytext=(0, 10), ha='center', fontsize=9)

    plt.tight_layout()
    plt.savefig('rocket-sim/03_staging.png', dpi=150)
    print(f"\n  📈 Grafik disimpan: rocket-sim/03_staging.png")


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    print("\n" + "🚀" * 30)
    print("  BELAJAR ROCKET ENGINEERING: Staging")
    print("🚀" * 30)

    single_vs_two_stage()
    dv_total, saturn_results = simulasi_saturn_v()
    optimal_results = optimal_staging()
    buat_grafik(saturn_results, optimal_results)

    print("\n" + "=" * 60)
    print("📚 RANGKUMAN")
    print("=" * 60)
    print("""
  1. Staging = membuang bagian roket yang sudah kosong
  2. Staging memberikan bonus delta-v yang signifikan
  3. Diminishing returns — 2-3 stage biasanya optimal
  4. Saturn V: 3 stage, bisa bawa manusia ke Bulan
  5. Falcon 9: 2 stage, stage 1 mendarat kembali (reusable!)

  🎉 Selamat! Kamu sudah belajar 3 konsep dasar rocket engineering:
     - Persamaan Tsiolkovsky (delta-v)
     - Simulasi peluncuran (thrust, gravity, drag)
     - Staging (optimasi multi-stage)
""")
