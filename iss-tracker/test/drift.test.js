import assert from "node:assert/strict";
import test from "node:test";
import { horizontalDriftKm } from "../src/drift.js";

test("selisih 1° lintang di khatulistiwa sekitar 111 km", () => {
  const km = horizontalDriftKm(0, 0, (1 * Math.PI) / 180, 0);
  assert.ok(km > 110 && km < 112, String(km));
});

test("selisih 1° bujur di lintang tinggi jauh lebih kecil dari 111 km", () => {
  const lat = (80 * Math.PI) / 180;
  const km = horizontalDriftKm(80, 10, lat, (11 * Math.PI) / 180);
  assert.ok(km > 15 && km < 25, String(km));
});

test("bujur di seberang garis tanggal dihitung sebagai jarak pendek", () => {
  const km = horizontalDriftKm(0, 179.8, 0, (-179.8 * Math.PI) / 180);
  assert.ok(km > 20 && km < 80, String(km));
});
