/**
 * Reusable upload card component.
 *
 * Provides the standard PixelForge image-upload entry point, including drag/click
 * affordances, helper text, and active-file state styling.
 */

import PropTypes from 'prop-types';
import { useFileUpload } from '@/shared/hooks/useFileUpload';
import { AcceptableImageMimeTypes } from '@/shared/lib/fileUtils';

/**
 * Render the standard upload card and hidden file input.
 *
 * @returns {JSX.Element} Rendered UI.
 */
export default function UploadCard({
  inputId,
  inputRef: externalRef,
  onChange,
  onValidationError,
  helperText,
  accept = AcceptableImageMimeTypes,
  className = '',
  heightClass = 'h-36',
  validate = true,
  clearErrorAfterMs = 5000,
  maxSizeMB,
  hasActiveFile = false,
}) {
  const { isDragging, error, inputRef, handlers } = useFileUpload({
    externalInputRef: externalRef,
    validate,
    maxSizeMB,
    clearErrorAfterMs,
    onValidationError,
    onFileSelect: (file) => onChange?.({ target: { files: [file] } }),
  });

  let cardStateClass =
    'border-pf-editorial-line bg-pf-editorial-base hover:border-pf-editorial-accent hover:bg-pf-editorial-raised';
  let iconWrapClass = 'border-pf-editorial-line text-pf-editorial-accent';
  let titleClass = 'text-pf-editorial-ink group-hover:text-pf-editorial-accent';
  let helperClass = 'text-pf-editorial-muted';

  let uploadStatusText = hasActiveFile
    ? 'Replace image'
    : 'Click, drop, drag or paste';
  let displayHelperText = hasActiveFile ? 'Drop a new file here' : helperText;

  if (error) {
    cardStateClass =
      'border-pf-danger bg-pf-danger-soft hover:border-pf-danger';
    iconWrapClass = 'bg-pf-danger-soft border-pf-danger/30 text-pf-danger';
    titleClass = 'text-pf-danger group-hover:text-pf-danger';
    helperClass = 'text-pf-danger';
    uploadStatusText = error;
    displayHelperText = 'Please try another file';
  } else if (isDragging) {
    cardStateClass = 'border-pf-editorial-accent bg-pf-editorial-accent-soft';
    uploadStatusText = 'Drop to upload';
  }

  const renderIcon = () => {
    if (error) {
      return (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    }

    if (hasActiveFile) {
      return (
        <svg
          className={`h-5 w-5 transition-transform ${isDragging ? '-rotate-180 text-pf-editorial-accent' : 'group-hover:-rotate-180'} duration-500`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      );
    }

    return (
      <svg
        className={`h-6 w-6 transition-transform ${isDragging ? 'scale-110 text-pf-editorial-accent' : 'group-hover:scale-110'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        />
      </svg>
    );
  };

  return (
    <label
      htmlFor={inputId}
      aria-label={error || 'Upload image file'}
      onDragOver={handlers.onDragOver}
      onDragLeave={handlers.onDragLeave}
      onDrop={handlers.onDrop}
      className={`group relative flex w-full ${heightClass} cursor-pointer flex-col items-center justify-center rounded-pf-control border border-dashed transition-colors ${cardStateClass} ${className}`}
    >
      <div className="flex flex-col items-center justify-center px-4 pt-5 pb-6 text-center pointer-events-none">
        <div
          className={`mb-3 flex h-10 w-10 items-center justify-center rounded-pf-control border transition-colors ${iconWrapClass}`}
        >
          {renderIcon()}
        </div>

        <p
          className={`mb-1 text-sm font-semibold transition-colors ${titleClass}`}
        >
          {uploadStatusText}
        </p>
        <p className={`text-xs font-medium ${helperClass}`}>
          {displayHelperText}
        </p>
      </div>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handlers.onChange}
        onClick={(e) => e.stopPropagation()}
        className="hidden"
      />
    </label>
  );
}

UploadCard.propTypes = {
  inputId: PropTypes.string.isRequired,
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  onChange: PropTypes.func,
  onValidationError: PropTypes.func,
  helperText: PropTypes.string,
  accept: PropTypes.string,
  className: PropTypes.string,
  heightClass: PropTypes.string,
  validate: PropTypes.bool,
  clearErrorAfterMs: PropTypes.number,
  maxSizeMB: PropTypes.number,
  hasActiveFile: PropTypes.bool,
};
