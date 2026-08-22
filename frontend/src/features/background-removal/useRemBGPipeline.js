/**
 * Background removal pipeline hook.
 *
 * Binds the generic workspace pipeline to the background removal action set and
 * feature key.
 */

import { usePipeline } from '@/shared/hooks/ai/usePipeline';
import { useRemBGActions } from './useRemBGActions';

/**
 * Create background removal workspace pipeline state and handlers.
 *
 * @returns {object} Hook state and handlers.
 */
export function useRemBGPipeline(setProgress) {
  return usePipeline(setProgress, useRemBGActions, 'rembg');
}
