import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PropTypes from 'prop-types';
import { useUsageLimit } from './useUsageLimit';
import { USAGE_LIMIT_CACHE_TTL_MS } from './usageLimitCache';

function UsageProbe({ feature }) {
  const {
    usesRemaining,
    resetTimestamp,
    isLoading,
    recordUsage,
    forceMaxLimit,
  } = useUsageLimit(feature);

  return (
    <>
      <output data-testid="remaining">{usesRemaining}</output>
      <output data-testid="reset">{resetTimestamp ?? 'none'}</output>
      <output data-testid="loading">{String(isLoading)}</output>
      <button type="button" onClick={recordUsage}>
        Record usage
      </button>
      <button type="button" onClick={forceMaxLimit}>
        Force limit
      </button>
    </>
  );
}

UsageProbe.propTypes = {
  feature: PropTypes.string.isRequired,
};

const usageResponse = (usesRemaining, resetTimestamp = null) => ({
  ok: true,
  json: async () => ({
    uses_remaining: usesRemaining,
    reset_timestamp: resetTimestamp,
  }),
});

function deferredResponse() {
  let resolve;
  const promise = new Promise((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useUsageLimit', () => {
  it('reuses a fresh feature cache without another request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(usageResponse(2, 1234));
    vi.stubGlobal('fetch', fetchMock);

    const firstRender = render(<UsageProbe feature="cache-revisit" />);

    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    await waitFor(() => {
      expect(screen.getByTestId('remaining')).toHaveTextContent('2');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    firstRender.unmount();
    render(<UsageProbe feature="cache-revisit" />);

    expect(screen.getByTestId('remaining')).toHaveTextContent('2');
    expect(screen.getByTestId('reset')).toHaveTextContent('1234');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reuses stale data immediately and refreshes it silently', async () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
    const staleRefresh = deferredResponse();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(usageResponse(2, 2000))
      .mockReturnValueOnce(staleRefresh.promise);
    vi.stubGlobal('fetch', fetchMock);

    const firstRender = render(<UsageProbe feature="cache-stale" />);

    await waitFor(() => {
      expect(screen.getByTestId('remaining')).toHaveTextContent('2');
    });

    firstRender.unmount();
    nowSpy.mockReturnValue(1_000_000 + USAGE_LIMIT_CACHE_TTL_MS + 1);

    render(<UsageProbe feature="cache-stale" />);

    expect(screen.getByTestId('remaining')).toHaveTextContent('2');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      staleRefresh.resolve(usageResponse(1, 3000));
      await staleRefresh.promise;
    });

    await waitFor(() => {
      expect(screen.getByTestId('remaining')).toHaveTextContent('1');
      expect(screen.getByTestId('reset')).toHaveTextContent('3000');
    });
  });

  it('updates cached quota immediately after successful usage', async () => {
    const authoritativeRefresh = deferredResponse();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(usageResponse(2, 4000))
      .mockReturnValueOnce(authoritativeRefresh.promise);
    vi.stubGlobal('fetch', fetchMock);

    const firstRender = render(<UsageProbe feature="cache-record-usage" />);

    await waitFor(() => {
      expect(screen.getByTestId('remaining')).toHaveTextContent('2');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Record usage' }));
    expect(screen.getByTestId('remaining')).toHaveTextContent('1');

    firstRender.unmount();
    render(<UsageProbe feature="cache-record-usage" />);

    expect(screen.getByTestId('remaining')).toHaveTextContent('1');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      authoritativeRefresh.resolve(usageResponse(1, 4000));
      await authoritativeRefresh.promise;
    });
  });

  it('updates cached quota immediately when the backend reports the limit', async () => {
    const authoritativeRefresh = deferredResponse();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(usageResponse(1, 5000))
      .mockReturnValueOnce(authoritativeRefresh.promise);
    vi.stubGlobal('fetch', fetchMock);

    const firstRender = render(<UsageProbe feature="cache-force-limit" />);

    await waitFor(() => {
      expect(screen.getByTestId('remaining')).toHaveTextContent('1');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Force limit' }));
    expect(screen.getByTestId('remaining')).toHaveTextContent('0');

    firstRender.unmount();
    render(<UsageProbe feature="cache-force-limit" />);

    expect(screen.getByTestId('remaining')).toHaveTextContent('0');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      authoritativeRefresh.resolve(usageResponse(0, 6000));
      await authoritativeRefresh.promise;
    });

    await waitFor(() => {
      expect(screen.getByTestId('reset')).toHaveTextContent('6000');
    });
  });
});
