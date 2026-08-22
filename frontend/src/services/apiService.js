/**
 * Feedback API service facade.
 *
 * Kept temporarily for the feedback feature, which migrates in Phase 03.
 */

import { submitFeedback } from './features/feedbackService';

/**
 * API method used by the feedback form.
 */
export const apiService = {
  submitFeedback,
};
