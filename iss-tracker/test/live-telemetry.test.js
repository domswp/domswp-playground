import assert from "node:assert/strict";
import test from "node:test";
import { liveTelemetry } from "../src/liveTelemetry.js";

test("angka posisi dan kecepatan mengikuti propagasi, visibilitas tetap dari API terakhir", () => {
  const readout = liveTelemetry(
    {
      latitude: 0.5,
      longitude: -1.2,
      height: 418.2,
      velocityKmS: 7.66,
    },
    {
      visibility: "Bayangan Bumi",
      apiSyncLabel: "27/09/2026, 17.11.33",
      tleLabel: "27/09/2026, 00.26.14",
      note: "API: 0.00° N, 0.00° E · selisih ~12 km",
    }
  );

  assert.equal(readout.latRad, 0.5);
  assert.equal(readout.lonRad, -1.2);
  assert.equal(readout.altKm, 418.2);
  assert.equal(readout.velocityKmS, 7.66);
  assert.equal(readout.visibility, "Bayangan Bumi");
  assert.equal(readout.note, "API: 0.00° N, 0.00° E · selisih ~12 km");
});
