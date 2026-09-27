import assert from "node:assert/strict";
import test from "node:test";
import { formatSpeed } from "../src/format.js";

test("kecepatan ISS dalam km/s tampil sebagai km/jam", () => {
  // 7,66 km/s × 3600 = 27.576 km/jam. Faktor 3,6 hanya untuk m/s.
  assert.equal(formatSpeed(7.66), "27576 km/jam");
});

test("kecepatan API (km/jam) yang sudah diubah ke km/s tidak menyusut jadi puluhan", () => {
  const kmPerHour = 27596;
  const kmPerSec = kmPerHour / 3600;
  assert.equal(formatSpeed(kmPerSec), "27596 km/jam");
});
