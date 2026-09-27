import assert from "node:assert/strict";
import test from "node:test";
import { FALLBACK_TLE } from "../src/fallbackTle.js";
import { sampleOrbitGeodetic, setTle } from "../src/issPropagation.js";

test("garis orbit memakai satu putaran dari mean motion TLE, bukan konstanta 92,68 menit", () => {
  setTle(FALLBACK_TLE.line1, FALLBACK_TLE.line2);
  const meanMotionRevPerDay = Number(FALLBACK_TLE.line2.slice(52, 63));
  const expectedMs = (1440 / meanMotionRevPerDay) * 60 * 1000;
  const start = new Date("2026-09-27T17:00:00Z");
  const points = sampleOrbitGeodetic(8, start);
  const spanMs = points.at(-1).date.getTime() - points[0].date.getTime();
  assert.ok(
    Math.abs(spanMs - expectedMs) < 5000,
    `rentang garis ${spanMs} ms, diharapkan ~${expectedMs} ms`
  );
});
