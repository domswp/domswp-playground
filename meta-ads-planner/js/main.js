import { BENCHMARK, PRODUK_LABEL, SEGMEN_LABEL, getSegment } from "./segments.js";
import {
  angka,
  deriveFunnel,
  downstream,
  rupiah,
  scenarioRange,
  validate,
} from "./calc.js";

const BASELINE_KEY = "meta-ads-baselines";
const $ = (id) => document.getElementById(id);

// ---- Baseline (localStorage) ----
function loadBaselines() {
  try {
    return JSON.parse(localStorage.getItem(BASELINE_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveBaselines(obj) {
  localStorage.setItem(BASELINE_KEY, JSON.stringify(obj));
}
function refreshBaselineList() {
  const list = $("baseline-list");
  const data = loadBaselines();
  list.innerHTML = '<option value="">— baseline tersimpan —</option>';
  for (const name of Object.keys(data)) {
    const o = document.createElement("option");
    o.value = name;
    o.textContent = name;
    list.appendChild(o);
  }
}

$("save-baseline").addEventListener("click", () => {
  const name = $("baseline-name").value.trim();
  const cpm = Number($("cpm").value);
  const ctr = Number($("ctr").value);
  const cpl = Number($("cpl").value);
  if (!name) return alert("Beri nama baseline dulu.");
  if (!(cpm > 0 && ctr > 0 && cpl > 0)) return alert("Isi CPM, CTR, CPL yang valid dulu.");
  const data = loadBaselines();
  data[name] = { cpm, ctr, cpl };
  saveBaselines(data);
  refreshBaselineList();
  $("baseline-list").value = name;
});

$("baseline-list").addEventListener("change", (e) => {
  const name = e.target.value;
  if (!name) return;
  const b = loadBaselines()[name];
  if (b) {
    $("cpm").value = b.cpm;
    $("ctr").value = b.ctr;
    $("cpl").value = b.cpl;
  }
});

// ---- Hitung ----
$("hitung").addEventListener("click", run);

function readInputs() {
  return {
    cpm: Number($("cpm").value),
    ctrPct: Number($("ctr").value),
    cpl: Number($("cpl").value),
    budget: Number($("budget").value),
    durasiHari: Number($("durasi").value) || 30,
    produk: $("produk").value,
    segmen: $("segmen").value,
    lokasi: $("lokasi").value.trim() || "lokasi Anda",
    objektif: $("objektif").value,
    hilir: {
      janji: Number($("r-janji").value),
      visit: Number($("r-visit").value),
      booking: Number($("r-booking").value),
    },
  };
}

function run() {
  const inp = readInputs();

  // Funnel hilir wajib.
  if (![inp.hilir.janji, inp.hilir.visit, inp.hilir.booking].every((v) => v > 0 && v <= 100)) {
    alert("Isi semua tahap funnel hilir (1–100%).");
    return;
  }

  const funnel = deriveFunnel(inp);
  const alerts = validate({ ...inp, funnel, benchmark: BENCHMARK });

  renderAlerts(alerts);
  if (alerts.some((a) => a.level === "error")) {
    $("result").classList.remove("hidden");
    $("summary").innerHTML = "";
    $("funnel").innerHTML = "";
    $("funnel-hilir").innerHTML = "";
    $("scenario").innerHTML = "";
    $("targeting").classList.add("hidden");
    return;
  }

  const scen = scenarioRange({ budget: inp.budget, cpl: inp.cpl });

  const stages = [
    { key: "janji", label: "Janji temu", ratePct: inp.hilir.janji },
    { key: "visit", label: "Site visit", ratePct: inp.hilir.visit },
    { key: "booking", label: "Booking", ratePct: inp.hilir.booking },
  ];
  const hilir = downstream(funnel.leads, stages, inp.budget);

  renderSummary(inp, funnel, scen, hilir);
  renderFunnel(funnel);
  renderHilir(hilir);
  renderScenario(inp, scen);
  renderTargeting(inp);

  $("result").classList.remove("hidden");
  $("targeting").classList.remove("hidden");
  $("result").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderAlerts(alerts) {
  const el = $("alerts");
  if (!alerts.length) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = alerts
    .map((a) => `<div class="alert ${a.level}">${a.msg}</div>`)
    .join("");
}

function renderSummary(inp, funnel, scen, hilir) {
  const booking = hilir[hilir.length - 1];
  $("summary").innerHTML = `
    <div class="metric">
      <span class="m-label">Estimasi Leads</span>
      <span class="m-value">${angka(scen.pesimis.leads)} – ${angka(scen.optimis.leads)}</span>
      <span class="m-note">ekspektasi ${angka(scen.ekspektasi.leads)}</span>
    </div>
    <div class="metric">
      <span class="m-label">Cost per Lead</span>
      <span class="m-value">${rupiah(inp.cpl)}</span>
      <span class="m-note">${rupiah(scen.optimis.cplEfektif)} – ${rupiah(scen.pesimis.cplEfektif)}</span>
    </div>
    <div class="metric">
      <span class="m-label">Est. Booking</span>
      <span class="m-value">${angka(booking.count, 1)}</span>
      <span class="m-note">≈ ${rupiah(booking.costPer)} / booking</span>
    </div>
    <div class="metric">
      <span class="m-label">Jangkauan tayang</span>
      <span class="m-value">${angka(funnel.impressions)}</span>
      <span class="m-note">${angka(funnel.clicks)} klik</span>
    </div>`;
}

function bar(label, value, max, sub) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 2;
  return `<div class="bar-row">
    <span class="bar-label">${label}</span>
    <span class="bar-track"><span class="bar-fill" style="width:${pct}%"></span></span>
    <span class="bar-val">${sub}</span>
  </div>`;
}

function renderFunnel(funnel) {
  const max = funnel.impressions;
  $("funnel").innerHTML =
    bar("Tayang", funnel.impressions, max, angka(funnel.impressions)) +
    bar("Klik", funnel.clicks, max, `${angka(funnel.clicks)} · CTR ${((funnel.clicks / funnel.impressions) * 100).toFixed(2)}%`) +
    bar("Leads", funnel.leads, max, `${angka(funnel.leads)} · CVR ${(funnel.cvr * 100).toFixed(1)}%`);
}

function renderHilir(hilir) {
  const max = hilir[0].count;
  $("funnel-hilir").innerHTML = hilir
    .map((r) =>
      bar(
        r.label,
        r.count,
        max,
        `${angka(r.count, 1)}${r.ratePct ? ` · ${r.ratePct}%` : ""} · ${rupiah(r.costPer)}/unit`
      )
    )
    .join("");
}

function renderScenario(inp, scen) {
  const budgets = [inp.budget * 0.5, inp.budget, inp.budget * 2];
  const rows = budgets
    .map((b) => {
      const leadsE = b / inp.cpl;
      const leadsP = b / scen.pesimis.cplEfektif;
      const leadsO = b / scen.optimis.cplEfektif;
      return `<tr>
        <td>${rupiah(b)}</td>
        <td>${angka(leadsP)} – ${angka(leadsO)}</td>
        <td>${angka(leadsE)}</td>
        <td>${rupiah(inp.cpl)}</td>
      </tr>`;
    })
    .join("");
  $("scenario").innerHTML = `
    <thead><tr><th>Budget</th><th>Leads (rentang)</th><th>Ekspektasi</th><th>CPL</th></tr></thead>
    <tbody>${rows}</tbody>`;
}

function renderTargeting(inp) {
  const seg = getSegment(inp.produk, inp.segmen);
  const body = $("targeting-body");
  if (!seg) {
    body.innerHTML = `<p class="hint">Belum ada preset untuk kombinasi ini.</p>`;
    return;
  }
  const fillCopy = (t) =>
    t
      .replaceAll("{lokasi}", inp.lokasi)
      .replaceAll("{harga}", "harga menarik")
      .replaceAll("{dp}", "ringan")
      .replaceAll("{promo}", "promo terbatas");

  body.innerHTML = `
    <p class="seg-title">${PRODUK_LABEL[inp.produk]} · ${SEGMEN_LABEL[inp.segmen]}</p>
    <div class="t-grid">
      <div class="t-card">
        <h4>Persona</h4>
        <p>${seg.persona}</p>
      </div>
      <div class="t-card">
        <h4>Setting Meta</h4>
        <dl>
          <dt>Umur</dt><dd>${seg.umur[0]}–${seg.umur[1]}</dd>
          <dt>Gender</dt><dd>${seg.gender}</dd>
          <dt>Radius</dt><dd>${seg.radiusKm} km dari ${inp.lokasi}</dd>
        </dl>
      </div>
    </div>
    <div class="t-card">
      <h4>Interest</h4>
      <div class="chips">${seg.interest.map((i) => `<span class="chip">${i}</span>`).join("")}</div>
      <p class="exclude">Exclude: ${seg.exclude.join(", ")}</p>
    </div>
    <div class="t-card">
      <h4>Angle</h4>
      <ul>${seg.angle.map((a) => `<li>${a}</li>`).join("")}</ul>
    </div>
    <div class="t-card">
      <h4>Copy iklan <small>klik untuk salin</small></h4>
      ${seg.copy
        .map((c) => `<p class="copy" data-copy="${fillCopy(c).replace(/"/g, "&quot;")}">${fillCopy(c)}</p>`)
        .join("")}
    </div>
    <div class="t-card">
      <h4>Ide konten / kreatif</h4>
      <ul>${seg.konten.map((k) => `<li>${k}</li>`).join("")}</ul>
    </div>`;

  body.querySelectorAll(".copy").forEach((p) => {
    p.addEventListener("click", () => {
      navigator.clipboard?.writeText(p.dataset.copy);
      p.classList.add("copied");
      setTimeout(() => p.classList.remove("copied"), 1200);
    });
  });
}

refreshBaselineList();
