const COLS = 20;
const ROWS = 20;
const TICK_MS = 120;
const BEST_KEY = "snake-rust-best";

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const statusEl = document.getElementById("status");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");

const COLORS = {
  empty: "#0c1424",
  grid: "#111c33",
  body: "#5eb3ff",
  head: "#9bd0ff",
  food: "#ffb347",
};

let wasm = null;
let mem = null;
let best = Number(localStorage.getItem(BEST_KEY) || 0);
let timer = null;
let started = false;

bestEl.textContent = best;

function wasmUrl() {
  return new URL("./snake.wasm", import.meta.url);
}

async function loadWasm() {
  const res = await fetch(wasmUrl());
  const bytes = await res.arrayBuffer();
  const { instance } = await WebAssembly.instantiate(bytes, {});
  wasm = instance.exports;
  mem = wasm.memory;
}

function drawCell(x, y, color) {
  const cw = canvas.width / COLS;
  const ch = canvas.height / ROWS;
  const pad = Math.max(1, Math.floor(cw * 0.08));
  ctx.fillStyle = color;
  ctx.fillRect(x * cw + pad, y * ch + pad, cw - pad * 2, ch - pad * 2);
}

function render() {
  ctx.fillStyle = COLORS.empty;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const ptr = wasm.grid_ptr();
  const len = wasm.grid_len();
  const grid = new Uint8Array(mem.buffer, ptr, len);

  for (let i = 0; i < len; i++) {
    const v = grid[i];
    if (v === 0) continue;
    const x = i % COLS;
    const y = Math.floor(i / COLS);
    if (v === 1) drawCell(x, y, COLORS.body);
    else if (v === 2) drawCell(x, y, COLORS.head);
    else if (v === 3) drawCell(x, y, COLORS.food);
  }
}

function updateScore() {
  const s = wasm.score();
  scoreEl.textContent = s;
  if (s > best) {
    best = s;
    bestEl.textContent = best;
    localStorage.setItem(BEST_KEY, String(best));
  }
}

function loop() {
  wasm.tick();
  render();
  updateScore();
  if (wasm.is_over()) {
    gameOver();
  }
}

function gameOver() {
  clearInterval(timer);
  timer = null;
  started = false;
  overlayTitle.textContent = `Game Over · Skor ${wasm.score()}`;
  overlay.classList.remove("hidden");
}

function startGame() {
  overlay.classList.add("hidden");
  wasm.restart();
  render();
  updateScore();
  started = true;
  clearInterval(timer);
  timer = setInterval(loop, TICK_MS);
}

const KEY_DIR = {
  ArrowUp: 0,
  ArrowRight: 1,
  ArrowDown: 2,
  ArrowLeft: 3,
  w: 0,
  d: 1,
  s: 2,
  a: 3,
  W: 0,
  D: 1,
  S: 2,
  A: 3,
};

function handleDir(d) {
  if (!started) {
    startGame();
  }
  wasm.set_dir(d);
}

window.addEventListener("keydown", (e) => {
  const d = KEY_DIR[e.key];
  if (d !== undefined) {
    e.preventDefault();
    handleDir(d);
  } else if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    if (!started) startGame();
  }
});

document.querySelectorAll(".dir").forEach((btn) => {
  btn.addEventListener("click", () => handleDir(Number(btn.dataset.dir)));
});

document.getElementById("btn-restart").addEventListener("click", startGame);
overlay.addEventListener("click", startGame);

// Swipe untuk mobile.
let touchStart = null;
canvas.addEventListener(
  "touchstart",
  (e) => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  },
  { passive: true }
);
canvas.addEventListener(
  "touchend",
  (e) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) < 16 && Math.abs(dy) < 16) {
      if (!started) startGame();
      return;
    }
    if (Math.abs(dx) > Math.abs(dy)) handleDir(dx > 0 ? 1 : 3);
    else handleDir(dy > 0 ? 2 : 0);
    touchStart = null;
  },
  { passive: true }
);

async function boot() {
  try {
    await loadWasm();
    wasm.init(COLS, ROWS, (Math.random() * 0xffffffff) >>> 0);
    render();
    updateScore();
    statusEl.textContent = "Siap · tekan arah / ketuk untuk mulai";
    overlayTitle.textContent = "Snake";
    document.getElementById("overlay-sub").textContent =
      "Tekan arah, WASD, atau ketuk untuk mulai";
    overlay.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Gagal memuat WASM";
  }
}

boot();
