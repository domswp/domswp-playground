"""
02 - Simulasi Peluncuran Roket 1D
==================================

Sekarang kita simulasikan peluncuran roket dari permukaan Bumi!
Tidak cuma persamaan — kita hitung detik per detik apa yang terjadi.

Gaya-gaya yang bekerja pada roket:
    1. Thrust (↑)   — gaya dorong mesin
    2. Gravity (↓)   — gravitasi Bumi menarik ke bawah
    3. Drag (↓)      — hambatan udara (makin cepat, makin besar)

Persamaan gerak:
    F_net = Thrust - Weight - Drag
    a = F_net / massa
    v = v + a × dt
    h = h + v × dt

Drag dihitung dengan:
    Drag = 0.5 × ρ × v² × Cd × A

Dimana ρ (rho) = kepadatan udara (berkurang seiring ketinggian)
"""

import math

# ============================================================
# KONSTANTA
# ============================================================
G0 = 9.81           # gravitasi di permukaan (m/s²)
R_EARTH = 6_371_000 # radius Bumi (m)
RHO_0 = 1.225       # kepadatan udara di permukaan (kg/m³)
H_SCALE = 8500      # scale height atmosfer (m)

# ============================================================
# PARAMETER ROKET (mirip Falcon 9 first stage, disederhanakan)
# ============================================================
ROCKET = {
    "nama": "RocketSim-1",
    "massa_struktur": 25_000,       # kg
    "massa_bahan_bakar": 400_000,   # kg
    "massa_payload": 5_000,         # kg
    "thrust": 7_600_000,            # Newton (~7.6 MN, mirip Falcon 9)
    "isp": 282,                     # detik (sea level)
    "burn_time": 162,               # detik
    "Cd": 0.3,                      # drag coefficient
    "diameter": 3.7,                # meter
}


# ============================================================
# FUNGSI FISIKA
# ============================================================

def gravitasi(ketinggian: float) -> float:
    """Gravitasi berkurang seiring ketinggian (inverse square law)."""
    return G0 * (R_EARTH / (R_EARTH + ketinggian)) ** 2


def kepadatan_udara(ketinggian: float) -> float:
    """Kepadatan udara berkurang eksponensial seiring ketinggian."""
    if ketinggian > 100_000:  # di atas karman line, praktis vakum
        return 0.0
    return RHO_0 * math.exp(-ketinggian / H_SCALE)


def drag(kecepatan: float, ketinggian: float, cd: float, area: float) -> float:
    """Hitung gaya drag (hambatan udara)."""
    rho = kepadatan_udara(ketinggian)
    return 0.5 * rho * kecepatan ** 2 * cd * area


def laju_bakar(massa_bahan_bakar: float, burn_time: float) -> float:
    """Massa bahan bakar yang terbakar per detik."""
    return massa_bahan_bakar / burn_time


# ============================================================
# SIMULASI
# ============================================================

def simulasi_peluncuran(dt: float = 0.1):
    """
    Simulasi peluncuran roket detik per detik.
    dt = time step dalam detik (0.1 = tiap 0.1 detik)
    """

    r = ROCKET
    area = math.pi * (r["diameter"] / 2) ** 2

    massa_total = r["massa_struktur"] + r["massa_bahan_bakar"] + r["massa_payload"]
    massa_bb = r["massa_bahan_bakar"]
    burn_rate = laju_bakar(r["massa_bahan_bakar"], r["burn_time"])

    ketinggian = 0.0
    kecepatan = 0.0
    waktu = 0.0
    max_q = 0.0
    max_q_waktu = 0.0
    max_kecepatan = 0.0

    data = {
        "waktu": [],
        "ketinggian": [],
        "kecepatan": [],
        "percepatan": [],
        "drag": [],
        "massa": [],
    }

    print("=" * 60)
    print(f"🚀 SIMULASI PELUNCURAN: {r['nama']}")
    print("=" * 60)
    print(f"\n  Massa total    : {massa_total:>10,} kg")
    print(f"  Bahan bakar    : {massa_bb:>10,} kg")
    print(f"  Thrust         : {r['thrust']:>10,} N ({r['thrust']/1e6:.1f} MN)")
    print(f"  TWR awal       : {r['thrust'] / (massa_total * G0):>10.2f}")
    print(f"  Burn time      : {r['burn_time']:>10} s")

    twr = r["thrust"] / (massa_total * G0)
    if twr < 1.0:
        print(f"\n  ⚠️  TWR < 1! Roket tidak bisa lepas landas!")
        return None

    print(f"\n  {'Waktu':>7} {'Ketinggian':>12} {'Kecepatan':>12} {'Percepatan':>12} {'Massa':>10} {'Event'}")
    print(f"  {'-' * 70}")

    mesin_menyala = True
    sudah_meco = False
    apogee_tercapai = False
    karman_tercapai = False

    while True:
        g = gravitasi(ketinggian)
        gaya_drag = drag(abs(kecepatan), ketinggian, r["Cd"], area)

        if mesin_menyala and massa_bb > 0:
            gaya_thrust = r["thrust"]
            massa_bb -= burn_rate * dt
            massa_total -= burn_rate * dt
            if massa_bb <= 0:
                massa_bb = 0
                mesin_menyala = False
        else:
            gaya_thrust = 0

        berat = massa_total * g
        drag_arah = gaya_drag if kecepatan < 0 else -gaya_drag
        gaya_net = gaya_thrust - berat + drag_arah if kecepatan >= 0 else -berat - drag_arah
        percepatan = gaya_net / massa_total

        kecepatan += percepatan * dt
        ketinggian += kecepatan * dt
        waktu += dt

        dynamic_pressure = 0.5 * kepadatan_udara(ketinggian) * kecepatan ** 2
        if dynamic_pressure > max_q:
            max_q = dynamic_pressure
            max_q_waktu = waktu

        if abs(kecepatan) > max_kecepatan:
            max_kecepatan = abs(kecepatan)

        data["waktu"].append(waktu)
        data["ketinggian"].append(ketinggian)
        data["kecepatan"].append(kecepatan)
        data["percepatan"].append(percepatan)
        data["drag"].append(gaya_drag)
        data["massa"].append(massa_total)

        if not sudah_meco and not mesin_menyala:
            sudah_meco = True
            print(f"  {waktu:>7.1f} {ketinggian/1000:>11.1f}km {kecepatan:>11.0f}m/s {percepatan/G0:>11.1f}G {massa_total:>9,.0f} ← MECO! 🔥")

        if not karman_tercapai and ketinggian >= 100_000:
            karman_tercapai = True
            print(f"  {waktu:>7.1f} {ketinggian/1000:>11.1f}km {kecepatan:>11.0f}m/s {percepatan/G0:>11.1f}G {massa_total:>9,.0f} ← Karman Line! 🌌")

        if int(waktu * 10) % 300 == 0 and abs(waktu * 10 - round(waktu * 10)) < 0.01:
            event = "🔥" if mesin_menyala else "coast"
            print(f"  {waktu:>7.1f} {ketinggian/1000:>11.1f}km {kecepatan:>11.0f}m/s {percepatan/G0:>11.1f}G {massa_total:>9,.0f} {event}")

        if kecepatan < 0 and ketinggian < 0:
            ketinggian = 0
            break

        if not apogee_tercapai and kecepatan < 0 and not mesin_menyala:
            apogee_tercapai = True
            print(f"  {waktu:>7.1f} {ketinggian/1000:>11.1f}km {kecepatan:>11.0f}m/s {percepatan/G0:>11.1f}G {massa_total:>9,.0f} ← APOGEE! 🏔️")

        if waktu > 2000:
            break

    print(f"\n  📊 Statistik Penerbangan:")
    print(f"     Ketinggian maksimum : {max(data['ketinggian'])/1000:,.1f} km")
    print(f"     Kecepatan maksimum  : {max_kecepatan:,.0f} m/s ({max_kecepatan*3.6:,.0f} km/h, Mach {max_kecepatan/343:.1f})")
    print(f"     Max-Q               : {max_q/1000:,.1f} kPa pada T+{max_q_waktu:.1f}s")
    print(f"     Durasi penerbangan  : {waktu:,.0f} s ({waktu/60:.1f} menit)")

    if max(data['ketinggian']) >= 100_000:
        print(f"     🌌 Melewati Karman Line (100 km) — selamat, kamu ke luar angkasa!")
    else:
        print(f"     ❌ Tidak mencapai Karman Line (100 km)")

    return data


# ============================================================
# VISUALISASI
# ============================================================

def buat_grafik(data):
    """Buat grafik simulasi peluncuran."""

    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle(f'Simulasi Peluncuran: {ROCKET["nama"]}', fontsize=16, fontweight='bold')

    waktu = data["waktu"]

    # Ketinggian
    ax1 = axes[0][0]
    ax1.plot(waktu, [h / 1000 for h in data["ketinggian"]], color='#3498db', linewidth=2)
    ax1.axhline(y=100, color='red', linestyle='--', alpha=0.5, label='Karman Line (100 km)')
    ax1.set_ylabel('Ketinggian (km)')
    ax1.set_xlabel('Waktu (s)')
    ax1.set_title('Ketinggian vs Waktu')
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    # Kecepatan
    ax2 = axes[0][1]
    ax2.plot(waktu, data["kecepatan"], color='#e74c3c', linewidth=2)
    ax2.axhline(y=343, color='gray', linestyle='--', alpha=0.5, label='Mach 1 (343 m/s)')
    ax2.set_ylabel('Kecepatan (m/s)')
    ax2.set_xlabel('Waktu (s)')
    ax2.set_title('Kecepatan vs Waktu')
    ax2.legend()
    ax2.grid(True, alpha=0.3)

    # Percepatan (dalam G)
    ax3 = axes[1][0]
    ax3.plot(waktu, [a / G0 for a in data["percepatan"]], color='#2ecc71', linewidth=2)
    ax3.axhline(y=0, color='black', linestyle='-', alpha=0.3)
    ax3.set_ylabel('Percepatan (G)')
    ax3.set_xlabel('Waktu (s)')
    ax3.set_title('Percepatan vs Waktu')
    ax3.grid(True, alpha=0.3)

    # Massa
    ax4 = axes[1][1]
    ax4.plot(waktu, [m / 1000 for m in data["massa"]], color='#f39c12', linewidth=2)
    ax4.set_ylabel('Massa (ton)')
    ax4.set_xlabel('Waktu (s)')
    ax4.set_title('Massa vs Waktu')
    ax4.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig('rocket-sim/02_launch_sim.png', dpi=150)
    print(f"\n  📈 Grafik disimpan: rocket-sim/02_launch_sim.png")


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    print("\n" + "🚀" * 30)
    print("  BELAJAR ROCKET ENGINEERING: Simulasi Peluncuran 1D")
    print("🚀" * 30)

    data = simulasi_peluncuran()

    if data:
        buat_grafik(data)

    print("\n" + "=" * 60)
    print("📚 RANGKUMAN")
    print("=" * 60)
    print("""
  1. Roket harus punya TWR > 1 untuk lepas landas
  2. Gravity loss — sebagian delta-v 'hilang' melawan gravitasi
  3. Drag loss — hambatan udara paling besar di atmosfer bawah
  4. Max-Q = tekanan dinamis maksimum (momen paling stress buat roket)
  5. MECO = Main Engine Cut-Off (bahan bakar habis)
  6. Setelah MECO, roket 'coast' — naik karena momentum, lalu jatuh

  ➡️  Lanjut ke 03_staging.py untuk belajar kenapa roket punya tingkatan!
""")
