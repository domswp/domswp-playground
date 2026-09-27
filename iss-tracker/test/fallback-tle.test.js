import assert from "node:assert/strict";
import test from "node:test";
import { FALLBACK_TLE } from "../src/fallbackTle.js";

test("TLE cadangan tidak lebih lama dari snapshot 27 Sep 2026", () => {
  const year = 2000 + Number(FALLBACK_TLE.line1.slice(18, 20));
  const day = Number(FALLBACK_TLE.line1.slice(20, 32));
  assert.equal(year, 2026);
  assert.ok(day >= 269, `epoch hari ke-${day} lebih lama dari 26 Sep 2026`);
});
