import { useEffect, useId, useState } from 'react';
import PropTypes from 'prop-types';
import {
  FILE_LIMITS,
  UPLOAD_POLICIES,
} from '@/shared/config/imageValidation';
import { useFileUpload } from '@/shared/hooks/useFileUpload';
import { AcceptableImageMimeTypes } from '@/shared/lib/fileUtils';
import UploadPolicyDialog from './UploadPolicyDialog';
import {
  getFallbackLimits,
  getRuntimeLimits,
} from '@/shared/validation/validators/runtimeLimits';

const AllowedFormatsText = FILE_LIMITS.ALLOWED_EXTENSIONS.map((e) =>
  e.toUpperCase(),
).join(', ');

/**
 * Image upload dropzone component supporting click, drag & drop, and clipboard paste.
 * Enforces allowed file types via native OS file picker and internal validation hook.
 *
 * @param {Object} props
 * @param {(file: File) => void} props.onFileSelect - Callback executed when a valid image file is selected.
 * @param {boolean} [props.requireGrayscale=false] - Whether uploaded images must pass grayscale validation.
 * @param {boolean} [props.compact=false] - Opt into a shorter editorial upload surface without changing upload behavior.
 * @returns {JSX.Element}
 */
export default function UploadDropzone({
  onFileSelect,
  requireGrayscale = false,
  variant = 'default',
  compact = false,
  uploadPolicy = UPLOAD_POLICIES.DEFAULT,
}) {
  const errorId = useId();
  const [limits, setLimits] = useState(getFallbackLimits);
  const {
    isDragging,
    error,
    inputRef,
    handlers,
    uploadConfirmation,
    confirmUpload,
    dismissUploadConfirmation,
    chooseAnotherImage,
  } = useFileUpload({
    onFileSelect,
    requireGrayscale,
    clearErrorAfterMs: 5000,
    uploadPolicy,
  });

  useEffect(() => {
    if (!uploadPolicy.showAiLimits) return undefined;

    let active = true;
    getRuntimeLimits().then((runtimeLimits) => {
      if (active) setLimits(runtimeLimits);
    });

    return () => {
      active = false;
    };
  }, [uploadPolicy.showAiLimits]);

  const helperText = uploadPolicy.showAiLimits
    ? `${AllowedFormatsText} · File size: up to ${limits.upload.max_file_size_mb}MB · AI resolution: up to ${limits.upload.max_megapixels}MP`
    : `${AllowedFormatsText} · Processed locally in your browser`;

  const getDropzoneStateClasses = () => {
    if (variant === 'editorial') {
      if (isDragging)
        return 'border-pf-editorial-accent bg-pf-editorial-accent-soft';
      if (error) return 'border-pf-danger bg-pf-danger-soft';
      return 'border-pf-editorial-line bg-transparent hover:border-pf-editorial-accent hover:bg-pf-editorial-surface';
    }

    if (isDragging) return 'border-pf-accent bg-pf-accent-soft';
    if (error) return 'border-pf-danger bg-pf-danger-soft';
    return 'border-pf-line-strong bg-pf-surface hover:border-pf-accent hover:bg-pf-accent-soft/30';
  };

  let iconClasses = 'bg-pf-accent-soft border-pf-line text-pf-accent';
  if (variant === 'editorial') {
    iconClasses =
      'border-pf-editorial-line bg-pf-editorial-surface text-pf-editorial-accent';
  }
  if (error) {
    iconClasses = 'bg-pf-danger-soft border-pf-danger/30 text-pf-danger';
  }

  return (
    <div className="w-full">
      <button
        type="button"
        aria-label="Upload image file"
        aria-describedby={error ? errorId : undefined}
        className={`flex w-full cursor-pointer items-center justify-center rounded-pf-control border border-dashed text-center transition-colors ${
          compact ? 'p-6 sm:p-8' : 'p-8 sm:p-10'
        } ${
          variant === 'editorial' && !compact ? 'min-h-[26rem]' : ''
        } ${getDropzoneStateClasses()}`}
        onDragOver={handlers.onDragOver}
        onDragLeave={handlers.onDragLeave}
        onDrop={handlers.onDrop}
        onClick={handlers.onClick}
      >
        <input
          type="file"
          className="hidden"
          ref={inputRef}
          accept={AcceptableImageMimeTypes}
          onChange={handlers.onChange}
          onClick={(event) => event.stopPropagation()}
        />

        <div className="pointer-events-none flex flex-col items-center justify-center space-y-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-pf-control border transition-colors
            ${iconClasses}`}
          >
            {error ? (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
          </div>

          <div>
            {error ? (
              <>
                <p className="mx-auto max-w-100 px-4 text-base font-bold leading-snug text-pf-danger sm:text-lg">
                  {error}
                </p>
                <p className="mt-2 text-sm font-medium text-pf-danger">
                  Supported formats: {AllowedFormatsText}
                </p>
              </>
            ) : (
              <>
                <p
                  className={`text-lg font-bold ${
                    variant === 'editorial'
                      ? 'text-pf-editorial-ink'
                      : 'text-pf-ink'
                  }`}
                >
                  Drop, paste, or choose an image
                </p>
                <p
                  className={`mt-1.5 text-sm font-medium ${
                    variant === 'editorial'
                      ? 'text-pf-editorial-muted'
                      : 'text-pf-ink-muted'
                  }`}
                >
                  {helperText}
                </p>
              </>
            )}
          </div>
        </div>
      </button>

      <span id={errorId} className="sr-only" role="alert" aria-atomic="true">
        {error}
      </span>

      <UploadPolicyDialog
        confirmation={uploadConfirmation}
        onConfirm={confirmUpload}
        onChooseAnother={chooseAnotherImage}
        onClose={dismissUploadConfirmation}
      />
    </div>
  );
}

UploadDropzone.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
  requireGrayscale: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'editorial']),
  compact: PropTypes.bool,
  uploadPolicy: PropTypes.shape({
    fileSizeMode: PropTypes.oneOf(['none', 'backend', 'confirm', 'optimize'])
      .isRequired,
    resolutionMode: PropTypes.oneOf(['auto', 'confirm', 'warn']).isRequired,
    showAiLimits: PropTypes.bool,
    warningPixels: PropTypes.number,
  }),
};
