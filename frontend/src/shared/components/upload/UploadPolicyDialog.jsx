import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import AppModals from '@/shared/components/common/AppModals';
import { formatMegapixels } from '@/shared/validation/validators/resolutionValidation';

/** Shared consent dialog for AI resizing and local browser-memory warnings. */
export default function UploadPolicyDialog({
  confirmation,
  onConfirm,
  onChooseAnother,
  onClose,
}) {
  const chooseAnotherRef = useRef(null);
  const isAiResize = Boolean(confirmation?.requiresResizeConfirmation);
  const isAiOptimization = Boolean(
    confirmation?.requiresAiOptimizationConfirmation,
  );

  useEffect(() => {
    if (confirmation) chooseAnotherRef.current?.focus();
  }, [confirmation]);

  let title = 'Very large image';
  let primaryLabel = 'Continue anyway';
  let content = confirmation && (
    <div className="space-y-3 text-left">
      <p className="font-semibold text-pf-editorial-ink">
        {confirmation.metadata.width} × {confirmation.metadata.height} pixels (
        {formatMegapixels(confirmation.metadata.pixels)}MP)
      </p>
      <p>
        This image has a very high resolution and may use significant memory
        while PixelForge processes it locally in your browser. Continuing may
        make the page slower or cause the browser tab to become unstable on
        some devices.
      </p>
      <p>PixelForge will keep the original file and dimensions.</p>
    </div>
  );

  if (isAiResize) {
    title = 'Resize for AI processing?';
    primaryLabel = 'Resize & continue';
    content = (
      <div className="space-y-3 text-left">
        <p className="font-semibold text-pf-editorial-ink">
          This image is {confirmation.metadata.width} ×{' '}
          {confirmation.metadata.height} pixels ({formatMegapixels(
            confirmation.metadata.pixels,
          )}
          MP).
        </p>
        <p>
          AI processing accepts up to{' '}
          {confirmation.resolutionLimit.maxMegapixels}MP. PixelForge can
          proportionally resize the image to that resolution while preserving
          the existing resize method.
        </p>
        <p>
          Resolution is separate from the {confirmation.fileSizeLimitMB}MB
          file-size limit. Nothing will be resized unless you continue.
        </p>
      </div>
    );
  }

  if (isAiOptimization) {
    title = 'Image exceeds the upload limit';
    primaryLabel = 'Optimize & continue';
    content = (
      <div className="space-y-3 text-left">
        <p className="font-semibold text-pf-editorial-ink">
          Your image is{' '}
          {(confirmation.actualFileSizeBytes / 1024 / 1024).toFixed(1)}MB,
          while PixelForge AI processing accepts files up to{' '}
          {confirmation.fileSizeLimitMB}MB.
        </p>
        <p>
          PixelForge can optimize the file in your browser before upload while
          preserving its dimensions whenever possible. This may cause a small
          reduction in image quality.
        </p>
        {confirmation.alsoExceedsResolution && (
          <p>
            Its resolution also exceeds the{' '}
            {confirmation.resolutionLimit.maxMegapixels}MP AI processing limit,
            so optimization will proportionally reduce dimensions as part of
            the same step.
          </p>
        )}
        <p>The original will not be uploaded before you continue.</p>
      </div>
    );
  }

  return (
    <AppModals
      isOpen={Boolean(confirmation)}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={chooseAnotherRef}
            type="button"
            onClick={onChooseAnother}
            className="rounded-pf-control border border-pf-editorial-line px-5 py-2 font-bold text-pf-editorial-ink transition-colors hover:border-pf-editorial-muted"
          >
            Choose another image
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-pf-control bg-pf-editorial-ink px-5 py-2 font-bold text-pf-editorial-base transition-colors hover:bg-pf-editorial-accent"
          >
            {primaryLabel}
          </button>
        </div>
      }
    >
      {content}
    </AppModals>
  );
}

UploadPolicyDialog.propTypes = {
  confirmation: PropTypes.shape({
    requiresResizeConfirmation: PropTypes.bool,
    requiresAiOptimizationConfirmation: PropTypes.bool,
    alsoExceedsResolution: PropTypes.bool,
    actualFileSizeBytes: PropTypes.number,
    metadata: PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
      pixels: PropTypes.number.isRequired,
    }).isRequired,
    resolutionLimit: PropTypes.shape({
      maxMegapixels: PropTypes.number,
    }),
    fileSizeLimitMB: PropTypes.number,
  }),
  onConfirm: PropTypes.func.isRequired,
  onChooseAnother: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
