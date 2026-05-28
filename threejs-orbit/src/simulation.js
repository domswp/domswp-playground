import { G0 } from "./constants.js";
import { ROCKET_META, MISSIONS, ENVIRONMENTS } from "./rocketMeta.js";

export { formatMass, formatThrust } from "./format.js";

export function getMeta(rocket) {
  return ROCKET_META[rocket.id] ?? {};
}

export function getMissionPayload(rocket, missionId) {
  const m = getMeta(rocket).missions?.[missionId];
  return m == null ? 0 : m;
}

export function missionSupported(rocket, missionId) {
  const m = getMeta(rocket).missions?.[missionId];
  return m != null && m > 0;
}

export function massAbove(rocket, stageIndex, payloadKg = 0) {
  let m = payloadKg;
  for (let i = rocket.stages.length - 1; i >= stageIndex; i--) {
    const s = rocket.stages[i];
    if (s.isFairing || s.isPayload) {
      m += s.massaStruktur;
    } else {
      m += s.massaStruktur + s.massaBB;
    }
  }
  return m;
}

export function liftoffMass(rocket, payloadKg) {
  return massAbove(rocket, 0, payloadKg);
}

export function deltaVStage(stage, m0, mf, ispOverride) {
  const isp = ispOverride ?? stage.ispVac;
  if (!isp || stage.massaBB === 0) return 0;
  if (mf <= 0 || m0 <= mf) return 0;
  return isp * G0 * Math.log(m0 / mf);
}

export function computeStageStats(rocket, stageIndex, missionId, envId) {
  const stage = rocket.stages[stageIndex];
  const env = ENVIRONMENTS[envId] ?? ENVIRONMENTS.standard;
  const payload = getMissionPayload(rocket, missionId);
  const topPayload =
    stage.isFairing || stage.isPayload ? payload : payload;

  const m0 = massAbove(rocket, stageIndex, topPayload);
  const mf =
    stage.isFairing || stage.isPayload
      ? m0 - stage.massaStruktur
      : m0 - stage.massaBB;

  const dv = deltaVStage(stage, m0, mf);
  const thrust = stage.thrust * env.thrustMult;
  const twr =
    thrust > 0 && m0 > 0 ? (thrust / (m0 * G0)).toFixed(2) : "—";

  return { m0, mf, dv, twr, thrust, payloadUsed: topPayload, env };
}

export function computeTotalDeltaV(rocket, missionId) {
  const payload = getMissionPayload(rocket, missionId);
  let total = 0;
  for (let i = 0; i < rocket.stages.length; i++) {
    const s = rocket.stages[i];
    if (s.isFairing || s.isPayload || !s.massaBB) continue;
    const { dv } = computeStageStats(rocket, i, missionId, "standard");
    total += dv;
  }
  return total;
}

export function firstEngineStageIndex(rocket) {
  return rocket.stages.findIndex(
    (s) => !s.isFairing && !s.isPayload && s.engines > 0
  );
}

export function computeLiftoffTwr(rocket, missionId, envId) {
  const env = ENVIRONMENTS[envId] ?? ENVIRONMENTS.standard;
  const payload = getMissionPayload(rocket, missionId);
  const m0 = liftoffMass(rocket, payload);
  const idx = firstEngineStageIndex(rocket);
  if (idx < 0) return null;
  const thrust = rocket.stages[idx].thrust * env.thrustMult;
  return thrust / (m0 * G0);
}

export function assessMission(rocket, missionId, envId) {
  const mission = MISSIONS[missionId];
  const supported = missionSupported(rocket, missionId);
  const totalDv = computeTotalDeltaV(rocket, missionId);
  const twr = computeLiftoffTwr(rocket, missionId, envId);
  const payload = getMissionPayload(rocket, missionId);

  let status = "ok";
  let summary = "Margin Δv cukup untuk misi ini (perkiraan).";

  if (!supported) {
    status = "na";
    summary = "Roket ini tidak dikonfigurasi umum untuk misi ini.";
  } else if (twr != null && twr < 1.05) {
    status = "warn";
    summary = "TWR liftoff rendah — mungkin tidak lepas landas dengan payload penuh.";
  } else if (totalDv < mission.dvRequired * 0.92) {
    status = "warn";
    summary = "Δv total di bawah kebutuhan tipikal misi — payload mungkin harus dikurangi.";
  } else if (totalDv < mission.dvRequired) {
    status = "marginal";
    summary = "Δv mendekati minimum — margin tipis.";
  }

  return {
    status,
    summary,
    supported,
    totalDv,
    dvRequired: mission.dvRequired,
    twr,
    payload,
    liftoffMass: liftoffMass(rocket, payload),
  };
}

export function getStagingEvents(rocket) {
  return rocket.stages.map((s, i) => ({
    index: i,
    id: s.id,
    label: s.nama,
    kind: s.isFairing || s.isPayload ? "payload" : "propulsive",
    hasEngines: !s.isFairing && !s.isPayload && s.engines > 0,
  }));
}
