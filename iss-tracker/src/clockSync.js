/**
 * Selisih agar jam simulasi menyamai waktu pengamatan API.
 * Dihitung dari jam dinding, supaya selisih yang stabil tidak terhapus di poll berikutnya.
 */
export function clockOffsetFromApi(apiTimestampSec, wallNowMs) {
  const apiMs = Number(apiTimestampSec) * 1000;
  const wall = Number(wallNowMs);
  if (!Number.isFinite(apiMs) || !Number.isFinite(wall)) return 0;
  return apiMs - wall;
}
