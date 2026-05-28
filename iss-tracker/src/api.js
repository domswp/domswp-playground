import { ISS_NORAD_ID } from "./constants.js";

const BASE = "https://api.wheretheiss.at/v1/satellites";

export async function fetchTle() {
  const res = await fetch(`${BASE}/${ISS_NORAD_ID}/tles`);
  if (!res.ok) throw new Error(`TLE HTTP ${res.status}`);
  const data = await res.json();
  if (!data.line1 || !data.line2) throw new Error("TLE tidak lengkap");
  return {
    line1: data.line1.trim(),
    line2: data.line2.trim(),
    tleTimestamp: data.tle_timestamp,
    name: data.name || "iss",
  };
}

export async function fetchIssNow() {
  const res = await fetch(`${BASE}/${ISS_NORAD_ID}`);
  if (!res.ok) throw new Error(`ISS HTTP ${res.status}`);
  return res.json();
}
