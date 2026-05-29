// Mesin hitung — funnel media + kalibrasi + funnel hilir + validasi.
// Semua nilai uang dalam Rupiah. CTR & rate tahap dalam PERSEN (mis. 1.2 = 1,2%).

/**
 * Turunkan funnel dari data terkalibrasi (CPM, CTR, CPL) + budget.
 * Hubungan: CPC = CPM/1000/CTR ; CVR(klik→lead) = CPC/CPL.
 */
export function deriveFunnel({ cpm, ctrPct, cpl, budget }) {
  const ctr = ctrPct / 100;
  const cpc = cpm / 1000 / ctr;
  const cvr = cpc / cpl; // fraksi klik → lead
  const impressions = (budget / cpm) * 1000;
  const clicks = impressions * ctr;
  const leads = clicks * cvr; // setara budget/cpl
  return {
    cpc,
    cvr,
    impressions,
    clicks,
    leads,
    cpl,
  };
}

/**
 * Rentang skenario berdasarkan multiplier CPL.
 * Pesimis = CPL lebih mahal (leads turun), Optimis = CPL lebih murah.
 */
export function scenarioRange(base, opts = {}) {
  const pesimisMul = opts.pesimisMul ?? 1.35;
  const optimisMul = opts.optimisMul ?? 0.8;
  const mk = (mul) => {
    const leads = base.budget / (base.cpl * mul);
    return {
      cplEfektif: base.cpl * mul,
      leads,
    };
  };
  return {
    pesimis: mk(pesimisMul),
    ekspektasi: { cplEfektif: base.cpl, leads: base.budget / base.cpl },
    optimis: mk(optimisMul),
  };
}

/**
 * Funnel hilir properti. stages: [{ key, label, ratePct }].
 * ratePct = persen lolos dari tahap sebelumnya.
 * Mengembalikan jumlah + cost per tahap (biaya / jumlah tahap).
 */
export function downstream(leads, stages, budget) {
  let current = leads;
  const rows = [{ key: "lead", label: "Leads", count: leads, costPer: budget / leads }];
  for (const s of stages) {
    current = current * (s.ratePct / 100);
    rows.push({
      key: s.key,
      label: s.label,
      count: current,
      costPer: current > 0 ? budget / current : Infinity,
      ratePct: s.ratePct,
    });
  }
  return rows;
}

/**
 * Validasi & peringatan. Mengembalikan array {level, msg}.
 * level: "error" | "warn" | "info"
 */
export function validate({ cpm, ctrPct, cpl, budget, durasiHari, funnel, benchmark }) {
  const out = [];

  if (!(cpm > 0) || !(ctrPct > 0) || !(cpl > 0) || !(budget > 0)) {
    out.push({ level: "error", msg: "CPM, CTR, CPL, dan budget harus lebih dari 0." });
    return out;
  }

  // Konsistensi: CVR klik→lead harus 0 < cvr <= 1.
  if (funnel.cvr > 1) {
    out.push({
      level: "error",
      msg: `Angka tidak konsisten: CTR/CPM/CPL menghasilkan conversion klik→lead ${(funnel.cvr * 100).toFixed(
        0
      )}% (>100%). Cek lagi CPL atau CTR-nya.`,
    });
  } else if (funnel.cvr < 0.005) {
    out.push({
      level: "warn",
      msg: `Conversion klik→lead sangat kecil (${(funnel.cvr * 100).toFixed(
        2
      )}%). Pastikan CPL & CTR dari kampanye yang sama.`,
    });
  }

  // Learning phase Meta: butuh ~50 konversi/minggu agar stabil.
  const leadsPerWeek = (funnel.leads / Math.max(durasiHari, 1)) * 7;
  if (leadsPerWeek < 50) {
    out.push({
      level: "warn",
      msg: `Estimasi ~${leadsPerWeek.toFixed(
        0
      )} leads/minggu. Meta butuh ±50 konversi/minggu untuk keluar dari learning phase — pertimbangkan naikkan budget atau lebarkan audiens.`,
    });
  }

  // Diagnostik vs benchmark.
  if (benchmark) {
    if (ctrPct < benchmark.ctrPct * 0.7) {
      out.push({
        level: "info",
        msg: `CTR ${ctrPct}% di bawah acuan ~${benchmark.ctrPct}%. Indikasi kreatif/targeting bisa diperbaiki.`,
      });
    }
    const clickToLeadPct = funnel.cvr * 100;
    if (clickToLeadPct < benchmark.clickToLeadPct * 0.7) {
      out.push({
        level: "info",
        msg: `Klik→lead ${clickToLeadPct.toFixed(1)}% di bawah acuan ~${benchmark.clickToLeadPct}%. Indikasi landing page/form bisa dioptimalkan.`,
      });
    }
  }

  return out;
}

// ---- Formatter ----
export function rupiah(n) {
  if (!isFinite(n)) return "—";
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

export function angka(n, d = 0) {
  if (!isFinite(n)) return "—";
  return Number(n).toLocaleString("id-ID", { maximumFractionDigits: d });
}
