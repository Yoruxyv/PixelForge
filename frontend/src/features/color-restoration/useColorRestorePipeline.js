/**
 * Color restoration pipeline hook.
 *
 * Binds the generic workspace pipeline to the color restoration action set and
 * feature key.
 */

import { usePipeline } from '@/shared/hooks/ai/usePipeline';
import { useColorRestoreActions } from './useColorRestoreActions';

/**
 * Create color restoration workspace pipeline state and handlers.
 *
 * @returns {object} Hook state and handlers.
 */
export function useColorRestorePipeline(setProgress) {
  return usePipeline(setProgress, useColorRestoreActions, 'colorrestore');
}
