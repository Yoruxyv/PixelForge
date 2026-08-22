/**
 * Short-lived in-memory cache for backend-owned AI usage metadata.
 *
 * The cache survives feature route remounts but intentionally resets on a full
 * page reload. Entries are keyed by the backend feature identifier.
 */

/** Usage snapshots older than this are refreshed on the next feature mount. */
export const USAGE_LIMIT_CACHE_TTL_MS = 45_000;

const usageLimitCache = new Map();

/**
 * Read the latest cached usage snapshot for a feature.
 *
 * @param {string} feature Backend feature identifier.
 * @returns {{usesRemaining: number, resetTimestamp: number | null, fetchedAt: number} | null}
 * Cached snapshot, or null when the feature has not been observed yet.
 */
export function readUsageLimitCache(feature) {
  return usageLimitCache.get(feature) ?? null;
}

/**
 * Store usage metadata for a feature.
 *
 * @param {string} feature Backend feature identifier.
 * @param {{usesRemaining: number, resetTimestamp: number | null}} snapshot Usage metadata.
 * @param {number} fetchedAt Timestamp of the authoritative fetch. Use zero for
 * optimistic mutations that should be revalidated on revisit.
 * @returns {{usesRemaining: number, resetTimestamp: number | null, fetchedAt: number}}
 * Stored cache entry.
 */
export function writeUsageLimitCache(
  feature,
  snapshot,
  fetchedAt = Date.now(),
) {
  const entry = {
    usesRemaining: snapshot.usesRemaining,
    resetTimestamp: snapshot.resetTimestamp,
    fetchedAt,
  };

  usageLimitCache.set(feature, entry);
  return entry;
}

/**
 * Determine whether a cached snapshot can be reused without revalidation.
 *
 * @param {{fetchedAt: number} | null} entry Cached usage entry.
 * @param {number} now Current timestamp.
 * @returns {boolean} True when the entry is still within the cache TTL.
 */
export function isUsageLimitCacheFresh(entry, now = Date.now()) {
  if (!entry) return false;

  const age = now - entry.fetchedAt;
  return age >= 0 && age < USAGE_LIMIT_CACHE_TTL_MS;
}
