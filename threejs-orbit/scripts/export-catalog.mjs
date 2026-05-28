#!/usr/bin/env node
/** Export katalog roket ke JSON (bisa dipakai rocket-sim / tools lain). */
import { writeFileSync } from "fs";
import { ROCKETS, MISSIONS, ENVIRONMENTS, ROCKET_META } from "../src/rockets.js";
import { assessMission } from "../src/simulation.js";

const catalog = {
  generated: new Date().toISOString(),
  missions: MISSIONS,
  environments: ENVIRONMENTS,
  rockets: Object.values(ROCKETS).map((r) => ({
    ...r,
    meta: ROCKET_META[r.id],
    assessment: {
      leo: assessMission(r, "leo", "standard"),
      gto: assessMission(r, "gto", "standard"),
      tli: assessMission(r, "tli", "standard"),
    },
  })),
};

writeFileSync(
  new URL("../data/rockets-catalog.json", import.meta.url),
  JSON.stringify(catalog, null, 2)
);
console.log("Wrote data/rockets-catalog.json");
