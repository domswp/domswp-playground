import assert from "node:assert/strict";
import test from "node:test";
import { clockOffsetFromApi } from "../src/clockSync.js";

test("koreksi jam mengikuti selisih API dan jam dinding, dan tidak hilang di poll berikutnya", () => {
  const wall = 1_790_529_000_000;
  const lagMs = 3000;
  const first = clockOffsetFromApi((wall - lagMs) / 1000, wall);
  const wallLater = wall + 45_000;
  const second = clockOffsetFromApi((wallLater - lagMs) / 1000, wallLater);
  assert.equal(first, -lagMs);
  assert.equal(second, -lagMs);
});
