/** Number of milliseconds in one day. */
export const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Checks whether a given timestamp is expired against a TTL window.
 *
 * @param {number|string|null|undefined} timestamp - Epoch timestamp in milliseconds.
 * @param {number} ttlMs - Time-to-live in milliseconds.
 * @returns {boolean} True if expired, false otherwise.
 */
export function isExpired(timestamp, ttlMs) {
  const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;

  if (!Number.isFinite(ts) || !Number.isFinite(ttlMs) || ttlMs <= 0) {
    return false;
  }

  return Date.now() - ts > ttlMs;
}
