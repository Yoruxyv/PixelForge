/**
 * Usage-limit hook for feature quota UI.
 *
 * Reuses short-lived per-feature quota metadata across route remounts while the
 * backend remains authoritative. Initial and stale refreshes never block the AI
 * workspace from rendering.
 */

import { useState, useCallback, useEffect } from 'react';
import { FEATURE_LIMITS } from '@/shared/config/ai';
import { DAY_MS } from '@/shared/lib/time';
import {
  isUsageLimitCacheFresh,
  readUsageLimitCache,
  writeUsageLimitCache,
} from './usageLimitCache';

const apiUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : '');

const inFlightUsageRequests = new Map();
const usageRequestVersions = new Map();

const normalizeUsageSnapshot = (data, maxLimit) => ({
  usesRemaining: Number.isFinite(data.uses_remaining)
    ? data.uses_remaining
    : maxLimit,
  resetTimestamp: Number.isFinite(data.reset_timestamp)
    ? data.reset_timestamp
    : null,
});

/**
 * Fetch the authoritative quota snapshot while deduplicating ordinary remounts.
 *
 * Forced refreshes supersede older in-flight requests so stale responses cannot
 * overwrite quota mutations recorded after processing.
 *
 * @param {string} feature Backend feature identifier.
 * @param {number} maxLimit Frontend fallback limit.
 * @param {boolean} force Whether to supersede an existing request.
 * @returns {Promise<{usesRemaining: number, resetTimestamp: number | null} | null>}
 * Latest authoritative snapshot, or null when unavailable or superseded.
 */
async function requestUsageSnapshot(feature, maxLimit, force = false) {
  if (!apiUrl) return null;

  const existingRequest = inFlightUsageRequests.get(feature);
  if (!force && existingRequest) return existingRequest.promise;

  const version = (usageRequestVersions.get(feature) ?? 0) + 1;
  usageRequestVersions.set(feature, version);

  const promise = (async () => {
    const res = await fetch(`${apiUrl}/usage?feature=${feature}`);
    if (!res.ok) return null;

    const data = await res.json();
    if (usageRequestVersions.get(feature) !== version) return null;

    const snapshot = normalizeUsageSnapshot(data, maxLimit);
    writeUsageLimitCache(feature, snapshot);
    return snapshot;
  })().finally(() => {
    const currentRequest = inFlightUsageRequests.get(feature);
    if (currentRequest?.version === version) {
      inFlightUsageRequests.delete(feature);
    }
  });

  inFlightUsageRequests.set(feature, { version, promise });
  return promise;
}

/**
 * Manage usage-limit state for a specific PixelForge feature.
 *
 * @param {string} feature Backend feature identifier.
 * @returns {object} Hook state and handlers.
 */
export function useUsageLimit(feature = 'upscale') {
  const maxLimit = FEATURE_LIMITS[feature] ?? FEATURE_LIMITS.default;
  const cachedUsage = readUsageLimitCache(feature);

  const [usesRemaining, setUsesRemaining] = useState(
    () => cachedUsage?.usesRemaining ?? maxLimit,
  );
  const [resetTimestamp, setResetTimestamp] = useState(
    () => cachedUsage?.resetTimestamp ?? null,
  );
  const [isLoading, setIsLoading] = useState(
    () => Boolean(apiUrl && !cachedUsage),
  );

  const applySnapshot = useCallback((snapshot) => {
    if (!snapshot) return;
    setUsesRemaining(snapshot.usesRemaining);
    setResetTimestamp(snapshot.resetTimestamp);
  }, []);

  const refreshUsage = useCallback(async () => {
    if (!apiUrl) return null;

    try {
      const snapshot = await requestUsageSnapshot(feature, maxLimit, true);
      applySnapshot(snapshot);
      return snapshot;
    } catch {
      console.error(`Failed to refresh usage data for ${feature}`);
      return null;
    }
  }, [applySnapshot, feature, maxLimit]);

  useEffect(() => {
    let active = true;
    const cached = readUsageLimitCache(feature);

    setUsesRemaining(cached?.usesRemaining ?? maxLimit);
    setResetTimestamp(cached?.resetTimestamp ?? null);

    if (!apiUrl) {
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    if (isUsageLimitCacheFresh(cached)) {
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    setIsLoading(!cached);

    requestUsageSnapshot(feature, maxLimit)
      .then((snapshot) => {
        if (active) applySnapshot(snapshot);
      })
      .catch(() => {
        if (!active) return;
      })
      .finally(() => {
        if (active && !cached) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [applySnapshot, feature, maxLimit]);

  const recordUsage = useCallback(() => {
    const cached = readUsageLimitCache(feature);
    const nextUsesRemaining = Math.max(
      0,
      (cached?.usesRemaining ?? usesRemaining) - 1,
    );
    const nextResetTimestamp = cached?.resetTimestamp ?? resetTimestamp;

    setUsesRemaining(nextUsesRemaining);
    writeUsageLimitCache(
      feature,
      {
        usesRemaining: nextUsesRemaining,
        resetTimestamp: nextResetTimestamp,
      },
      0,
    );

    void refreshUsage();
  }, [feature, refreshUsage, resetTimestamp, usesRemaining]);

  const forceMaxLimit = useCallback(() => {
    const fallbackResetTimestamp = Date.now() + DAY_MS;

    setUsesRemaining(0);
    setResetTimestamp(fallbackResetTimestamp);
    writeUsageLimitCache(
      feature,
      {
        usesRemaining: 0,
        resetTimestamp: fallbackResetTimestamp,
      },
      0,
    );

    void refreshUsage();
  }, [feature, refreshUsage]);

  return {
    usesRemaining,
    resetTimestamp,
    recordUsage,
    forceMaxLimit,
    refreshUsage,
    isLoading,
    maxLimit,
  };
}
