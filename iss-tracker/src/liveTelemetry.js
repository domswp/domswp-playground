/** Posisi dan kecepatan dari propagasi; visibilitas dan catatan tetap dari sinkron API terakhir. */
export function liveTelemetry(state, held) {
  return {
    latRad: state.latitude,
    lonRad: state.longitude,
    altKm: state.height,
    velocityKmS: state.velocityKmS,
    visibility: held.visibility,
    apiSyncLabel: held.apiSyncLabel,
    tleLabel: held.tleLabel,
    note: held.note,
  };
}
