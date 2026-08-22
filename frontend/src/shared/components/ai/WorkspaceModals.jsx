/**
 * Workspace alert and modal content resolver.
 *
 * Maps workspace alert types to user-facing modal messages, including limits,
 * validation warnings, processing errors, and storage/session notices.
 */

import { useEffect } from 'react';
import PropTypes from 'prop-types';
import AppModals from '@/shared/components/common/AppModals';
import CountdownTimer from '@/shared/components/common/CountdownTimer';
import { SESSION_EXPIRATION } from '@/shared/config/session';
import { makeStorageKeys } from '@/shared/storage/storageKeys';

/**
 * Render workspace-specific modal content for the active alert type.
 *
 * @returns {JSX.Element} Rendered UI.
 */
export default function WorkspaceModals({
  appAlert,
  setAppAlert,
  featureName,
  sessionImageLabel,
}) {
  const storageKeys = makeStorageKeys(featureName);

  useEffect(() => {
    if (appAlert.show) {
      localStorage.removeItem(storageKeys.ALERT);
    }
  }, [appAlert.show, storageKeys.ALERT]);

  const closeAndClear = () => {
    setAppAlert({ show: false, type: null });
    localStorage.removeItem(storageKeys.ALERT);
    localStorage.removeItem(`${storageKeys.ALERT}_message`);
    localStorage.removeItem(storageKeys.REFRESH_COUNT);
  };

  const processingFailureMessage =
    appAlert.message ||
    localStorage.getItem(`${storageKeys.ALERT}_message`) ||
    'Your image could not be processed. Try a smaller source image or start a new request.';

  return (
    <>
      <AppModals
        isOpen={appAlert.show && appAlert.type === 'potato'}
        onClose={closeAndClear}
        title="Processing in progress"
      >
        <div className="space-y-1.5 text-left">
          <p className="text-base font-semibold text-pf-editorial-ink">
            Your image is still being processed.
          </p>
          <p>
            Keep this workspace open while PixelForge completes the request.
            Refreshing the page will not make it finish sooner.
          </p>
        </div>
      </AppModals>

      <AppModals
        isOpen={appAlert.show && appAlert.type === 'dos'}
        onClose={closeAndClear}
        title="Service unavailable"
      >
        <div className="space-y-1.5 text-left">
          <p className="mb-2 text-base font-semibold text-pf-danger">
            PixelForge could not start this request.
          </p>
          <p>
            The processing service is currently busy. Your source image has not
            been changed.
          </p>
          <p>Please try again in a moment.</p>
        </div>
      </AppModals>

      <AppModals
        isOpen={appAlert.show && appAlert.type === 'processing_failed'}
        onClose={closeAndClear}
        title="Processing failed"
      >
        <div className="space-y-1.5 text-left">
          <p className="mb-2 text-base font-semibold text-pf-danger">
            We couldn&apos;t finish this image.
          </p>
          <p>{processingFailureMessage}</p>
          <p>If the source is very large or detailed, try a smaller file.</p>
        </div>
      </AppModals>

      <AppModals
        isOpen={appAlert.show && appAlert.type === 'auto_downscaled'}
        onClose={closeAndClear}
        title="Image adjusted"
      >
        <div className="space-y-1.5 text-left">
          <p className="mb-2 text-base font-semibold text-pf-editorial-ink">
            Source resized automatically
          </p>
          <p>
            Your image resolution was larger than PixelForge’s free processing
            limit, so we resized it before upload.
          </p>
          <p>
            This keeps processing fast, stable, and free for everyone while
            preserving as much visual quality as possible.
          </p>
        </div>
      </AppModals>

      <AppModals
        isOpen={appAlert.show && appAlert.type === 'reserved_warning'}
        onClose={() => setAppAlert({ show: false, type: null })}
        title="Session restored"
      >
        {appAlert.show && appAlert.type === 'reserved_warning' && (
          <div className="space-y-1.5 text-left">
            <p className="mb-2 text-base font-semibold text-pf-editorial-ink">
              Your result is available again.
            </p>
            <p>
              Just letting you know that your {sessionImageLabel} image won&apos;t
              stay here forever.
            </p>
            <p>
              Export it before it expires in{' '}
              <CountdownTimer
                targetTimestamp={
                  Number(localStorage.getItem(storageKeys.RESULT_TIMESTAMP)) +
                  SESSION_EXPIRATION.RESULT_MS
                }
                isWarning={true}
                onExpire={() => setAppAlert({ show: true, type: 'expired' })}
              />{' '}
              minutes.
            </p>
          </div>
        )}
      </AppModals>

      <AppModals
        isOpen={appAlert.show && appAlert.type === 'expired'}
        onClose={() => {
          setAppAlert({ show: false, type: null });
          localStorage.removeItem(storageKeys.ALERT);
          localStorage.removeItem(`${storageKeys.ALERT}_message`);
        }}
        title="Session expired"
      >
        <div className="space-y-1.5 text-left">
          <p className="mb-2 text-base font-semibold text-pf-danger">
            Image deleted for privacy.
          </p>
          <p>
            Your session timed out and your image was permanently deleted from
            your browser and our servers to protect your privacy.
          </p>
          <p>Upload the source again to start a new request.</p>
        </div>
      </AppModals>
    </>
  );
}

WorkspaceModals.propTypes = {
  appAlert: PropTypes.object.isRequired,
  setAppAlert: PropTypes.func.isRequired,
  featureName: PropTypes.string.isRequired,
  sessionImageLabel: PropTypes.string.isRequired,
};
