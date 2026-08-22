import PropTypes from 'prop-types';
import { FILE_LIMITS } from '@/shared/config/imageValidation';
import { useFileUpload } from '@/shared/hooks/useFileUpload';
import { AcceptableImageMimeTypes } from '@/shared/lib/fileUtils';

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
 * @returns {JSX.Element}
 */
export default function UploadDropzone({
  onFileSelect,
  requireGrayscale = false,
  variant = 'default',
}) {
  const { isDragging, error, inputRef, handlers } = useFileUpload({
    onFileSelect,
    requireGrayscale,
    clearErrorAfterMs: 5000,
  });

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
    <button
      type="button"
      aria-label="Upload image file"
      className={`flex w-full cursor-pointer items-center justify-center rounded-pf-control border border-dashed p-8 text-center transition-colors sm:p-10 ${
        variant === 'editorial' ? 'min-h-[26rem]' : ''
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
        onClick={(e) => e.stopPropagation()}
      />

      <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
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
                {AllowedFormatsText} · Max {FILE_LIMITS.MAX_FILE_SIZE_MB}MB
              </p>
            </>
          )}
        </div>
      </div>
    </button>
  );
}

UploadDropzone.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
  requireGrayscale: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'editorial']),
};
