import {
  apiClient,
  debugLog,
  uploadToAzure,
} from '@/shared/api/apiClient';

/**
 * Initializes and executes the object removal process.
 * @param {File} file - Original uploaded image.
 * @param {Blob} maskBlob - PNG mask generated from canvas.
 * @param {string} turnstileToken - Cloudflare Turnstile token.
 * @returns {Promise<Object>} The job ID object.
 */
export async function removeObjectFromImage(file, maskBlob, turnstileToken) {
  if (!maskBlob) {
    throw new Error('Please paint the object area before starting.');
  }

  debugLog(`[objectremove] init -> ${apiClient.apiUrl}/objectremove/init`);

  const initData = await apiClient.post('/objectremove/init', {
    cf_turnstile_response: turnstileToken,
    filename: file.name,
  });

  const {
    job_id,
    safe_filename,
    upload_url,
    mask_filename,
    mask_upload_url,
  } = initData;

  debugLog('[objectremove] image upload_url ->', upload_url);
  debugLog('[objectremove] mask upload_url ->', mask_upload_url);

  await uploadToAzure(
    upload_url,
    file,
    file.type || 'application/octet-stream',
  );
  await uploadToAzure(mask_upload_url, maskBlob, 'image/png');

  debugLog(
    `[objectremove] start -> ${apiClient.apiUrl}/objectremove/start`,
  );

  await apiClient.post('/objectremove/start', {
    job_id,
    safe_filename,
    mask_filename,
  });

  return { job_id };
}
