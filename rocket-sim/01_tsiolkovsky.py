"""
01 - Persamaan Tsiolkovsky (Rocket Equation)
=============================================

Ini adalah persamaan PALING FUNDAMENTAL di rocket engineering.
Ditemukan oleh Konstantin Tsiolkovsky (1903), ilmuwan Rusia.

Persamaan:
    Δv = Isp × g₀ × ln(m₀ / mf)

Dimana:
    Δv  = perubahan kecepatan yang bisa dicapai roket (m/s)
    Isp = specific impulse, efisiensi mesin (detik)
    g₀  = gravitasi Bumi = 9.81 m/s²
    m₀  = massa awal (struktur + bahan bakar)
    mf  = massa akhir (struktur saja, bahan bakar habis)
    ln  = logaritma natural

Semakin banyak bahan bakar dan semakin efisien mesin → semakin besar Δv.

Tapi ada masalah: bahan bakar juga punya massa!
Ini disebut "tyranny of the rocket equation" — untuk membawa
lebih banyak bahan bakar, kamu butuh lebih banyak bahan bakar lagi
untuk membawa bahan bakar itu. 🤯
"""

import math

# ============================================================
# KONSTANTA
# ============================================================
G0 = 9.81  # gravitasi Bumi (m/s²)

# ============================================================
# FUNGSI UTAMA
# ============================================================

def hitung_delta_v(isp: float, massa_awal: float, massa_akhir: float) -> float:
    """Hitung delta-v menggunakan persamaan Tsiolkovsky."""
    return isp * G0 * math.log(massa_awal / massa_akhir)


def hitung_mass_ratio(massa_awal: float, massa_akhir: float) -> float:
    """Hitung mass ratio (perbandingan massa awal vs akhir)."""
    return massa_awal / massa_akhir


# ============================================================
# CONTOH: Roket Sederhana
# ============================================================

def contoh_roket_sederhana():
    """Contoh dasar: satu roket dengan satu mesin."""

    print("=" * 60)
    print("🚀 CONTOH 1: Roket Sederhana")
    print("=" * 60)

    massa_struktur = 1000    # kg (badan roket, payload, dll)
    massa_bahan_bakar = 9000 # kg
    isp = 300                # detik (tipikal mesin kerosene/LOX)

    massa_awal = massa_struktur + massa_bahan_bakar
    massa_akhir = massa_struktur

    delta_v = hitung_delta_v(isp, massa_awal, massa_akhir)
    mass_ratio = hitung_mass_ratio(massa_awal, massa_akhir)

    print(f"\n  Massa struktur    : {massa_struktur:,.0f} kg")
    print(f"  Massa bahan bakar : {massa_bahan_bakar:,.0f} kg")
    print(f"  Massa total awal  : {massa_awal:,.0f} kg")
    print(f"  Specific Impulse  : {isp} s")
    print(f"\n  Mass Ratio        : {mass_ratio:.2f}")
    print(f"  Delta-v           : {delta_v:,.0f} m/s")
    print(f"                    = {delta_v / 1000:.2f} km/s")

    print(f"\n  📊 Untuk konteks:")
    print(f"     - Orbit rendah Bumi (LEO) butuh ~9,400 m/s")
    print(f"     - Roket ini bisa capai {delta_v:,.0f} m/s")
    if delta_v >= 9400:
        print(f"     - ✅ Cukup untuk mencapai orbit!")
    else:
        print(f"     - ❌ Belum cukup untuk orbit (kurang {9400 - delta_v:,.0f} m/s)")

    return delta_v


# ============================================================
# CONTOH: Bandingkan Mesin Berbeda
# ============================================================

def bandingkan_mesin():
    """Bandingkan berbagai jenis mesin roket."""

    print("\n" + "=" * 60)
    print("🔧 CONTOH 2: Bandingkan Jenis Mesin Roket")
    print("=" * 60)

    massa_awal = 10000  # kg
    massa_akhir = 1000  # kg

    mesin_list = [
        ("Solid Rocket (SRB)",         260),
        ("Kerosene/LOX (Merlin)",      311),
        ("Hydrolox (RS-25)",           452),
        ("Ion Thruster (Hall Effect)", 1500),
        ("VASIMR (plasma)",            5000),
    ]

    print(f"\n  Massa awal: {massa_awal:,} kg | Massa akhir: {massa_akhir:,} kg")
    print(f"  Mass ratio: {massa_awal / massa_akhir:.1f}\n")
    print(f"  {'Mesin':<32} {'Isp (s)':>8} {'Delta-v (m/s)':>14} {'Delta-v (km/s)':>15}")
    print(f"  {'-' * 72}")

    results = []
    for nama, isp in mesin_list:
        dv = hitung_delta_v(isp, massa_awal, massa_akhir)
        results.append((nama, isp, dv))
        print(f"  {nama:<32} {isp:>8} {dv:>14,.0f} {dv/1000:>15.2f}")

    print(f"\n  💡 Insight:")
    print(f"     - Ion thruster punya Isp tinggi (sangat efisien)")
    print(f"     - TAPI thrust-nya sangat kecil, jadi tidak bisa lepas landas")
    print(f"     - Untuk lepas landas dari Bumi, butuh thrust BESAR (solid/liquid)")
    print(f"     - Ion thruster cocok untuk perjalanan jauh di luar angkasa")

    return results


# ============================================================
# CONTOH: Tyranny of the Rocket Equation
# ============================================================

def tyranny_demo():
    """Demo kenapa menambah payload itu sangat 'mahal'."""

    print("\n" + "=" * 60)
    print("⚖️  CONTOH 3: Tyranny of the Rocket Equation")
    print("=" * 60)

    isp = 311  # Merlin engine
    target_dv = 9400  # m/s untuk LEO

    print(f"\n  Target: LEO ({target_dv:,} m/s) | Mesin: Merlin (Isp={isp}s)")
    print(f"\n  {'Payload (kg)':>14} {'Bahan Bakar (kg)':>18} {'Rasio BB:Payload':>18}")
    print(f"  {'-' * 54}")

    massa_struktur_ratio = 0.1  # 10% dari total massa adalah struktur

    for payload in [100, 500, 1000, 5000, 10000, 50000]:
        mass_ratio_needed = math.exp(target_dv / (isp * G0))
        massa_kering = payload / (1 - massa_struktur_ratio)
        massa_awal = massa_kering * mass_ratio_needed
        massa_bahan_bakar = massa_awal - massa_kering

        rasio = massa_bahan_bakar / payload
        print(f"  {payload:>14,} {massa_bahan_bakar:>18,.0f} {rasio:>18.1f}x")

    print(f"\n  💡 Insight:")
    print(f"     - Untuk setiap 1 kg payload, butuh ~{massa_bahan_bakar/payload:.0f}x kg bahan bakar!")
    print(f"     - Inilah kenapa biaya peluncuran sangat mahal")
    print(f"     - Dan kenapa SpaceX fokus pada reusable rockets")


# ============================================================
# VISUALISASI
# ============================================================

def buat_grafik():
    """Buat grafik delta-v vs mass ratio untuk berbagai Isp."""

    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import numpy as np

    mass_ratios = np.linspace(1.1, 20, 200)
    isp_values = [260, 311, 452, 1500]
    labels = ["Solid (260s)", "Kerosene (311s)", "Hydrolox (452s)", "Ion (1500s)"]
    colors = ["#e74c3c", "#f39c12", "#2ecc71", "#3498db"]

    fig, ax = plt.subplots(figsize=(10, 6))

    for isp, label, color in zip(isp_values, labels, colors):
        dv = isp * G0 * np.log(mass_ratios)
        ax.plot(mass_ratios, dv / 1000, label=label, color=color, linewidth=2)

    ax.axhline(y=9.4, color='red', linestyle='--', alpha=0.5, label='LEO (9.4 km/s)')
    ax.axhline(y=11.2, color='orange', linestyle='--', alpha=0.5, label='Escape velocity (11.2 km/s)')

    ax.set_xlabel('Mass Ratio (m₀/mf)', fontsize=12)
    ax.set_ylabel('Delta-v (km/s)', fontsize=12)
    ax.set_title('Persamaan Tsiolkovsky: Delta-v vs Mass Ratio', fontsize=14)
    ax.legend(fontsize=10)
    ax.grid(True, alpha=0.3)
    ax.set_xlim(1, 20)
    ax.set_ylim(0, 50)

    plt.tight_layout()
    plt.savefig('rocket-sim/01_tsiolkovsky.png', dpi=150)
    print(f"\n  📈 Grafik disimpan: rocket-sim/01_tsiolkovsky.png")


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    print("\n" + "🚀" * 30)
    print("  BELAJAR ROCKET ENGINEERING: Persamaan Tsiolkovsky")
    print("🚀" * 30)

    contoh_roket_sederhana()
    bandingkan_mesin()
    tyranny_demo()
    buat_grafik()

    print("\n" + "=" * 60)
    print("📚 RANGKUMAN")
    print("=" * 60)
    print("""
  1. Persamaan Tsiolkovsky: Δv = Isp × g₀ × ln(m₀/mf)
  2. Isp (specific impulse) = ukuran efisiensi mesin
  3. Mass ratio = perbandingan massa awal vs akhir
  4. Semakin besar mass ratio → semakin besar delta-v
  5. TAPI menambah bahan bakar juga menambah massa (tyranny!)

  ➡️  Lanjut ke 02_launch_sim.py untuk simulasi peluncuran!
""")
