/**
 * Feature action adapter for image upscaling.
 *
 * Binds the shared AI action workflow to the upscale API call and forwards the
 * selected scale option.
 */

import { useCallback } from 'react';
import { useActions } from '@/shared/hooks/ai/useActions';
import { uploadImage } from './upscaleService';

/**
 * Create image upscaling action handlers for the shared AI workflow.
 *
 * @returns {object} Hook state and handlers.
 */
export function useUpscaleActions(props) {
  const { scale } = props;
  const apiCallFn = useCallback(
    (file, token) => uploadImage(file, token, scale),
    [scale],
  );

  return useActions({ ...props, apiCallFn });
}
