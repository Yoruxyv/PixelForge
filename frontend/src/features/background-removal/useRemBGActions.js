/**
 * Feature action adapter for background removal.
 *
 * Binds the shared AI action workflow to the background removal API call.
 */

import { useCallback } from 'react';
import { useActions } from '@/shared/hooks/ai/useActions';
import { removeBackgroundImage } from './rembgService';

/**
 * Create background removal action handlers for the shared AI workflow.
 *
 * @returns {object} Hook state and handlers.
 */
export function useRemBGActions(props) {
  const apiCallFn = useCallback(
    (file, token) => removeBackgroundImage(file, token),
    [],
  );

  return useActions({ ...props, apiCallFn });
}
