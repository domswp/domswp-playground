export function formatMass(kg) {
  if (kg >= 1_000_000) return `${(kg / 1_000_000).toFixed(2)} t`;
  if (kg >= 1_000) return `${(kg / 1_000).toFixed(1)} t`;
  return `${kg.toFixed(0)} kg`;
}

export function formatThrust(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} MN`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)} kN`;
  return `${n.toFixed(0)} N`;
}

export function formatDv(mps) {
  if (!mps) return "—";
  return `${(mps / 1000).toFixed(2)} km/s`;
}
