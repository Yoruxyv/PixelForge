import PropTypes from 'prop-types';
import UploadDropzone from '@/shared/components/upload/UploadDropzone';

/**
 * Wrapper component that handles different tool states (uploading, processing, error, active).
 * @param {Object} props - The component props.
 * @param {Object} [props.file] - The currently selected file, if any.
 * @param {string} [props.error] - Error message to display, if any.
 * @param {boolean} [props.isProcessing] - Whether the tool is currently processing data.
 * @param {string} [props.processingText="Processing..."] - Text to display while processing.
 * @param {Function} props.onFileSelect - Callback when a file is selected via the dropzone.
 * @param {Function} [props.onReset] - Callback to reset the tool state after an error.
 * @param {React.ReactNode} props.children - The main tool content to display when ready.
 * @returns {JSX.Element}
 */
export default function ToolStateWrapper({
  file,
  error,
  isProcessing,
  processingText = 'Processing...',
  onFileSelect,
  onReset,
  children,
}) {
  if (!file) {
    return (
      <div className="mx-auto max-w-2xl rounded-pf-panel border border-pf-line bg-pf-surface p-2 shadow-pf-card">
        <UploadDropzone onFileSelect={onFileSelect} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-pf-panel border border-pf-danger/30 bg-pf-danger-soft p-8 text-center shadow-pf-card">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-pf-control border border-pf-danger/30 text-pf-danger">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </div>
        <h3 className="mb-2 text-2xl font-black text-pf-ink">
          Something went wrong
        </h3>
        <p className="mb-6 font-medium text-pf-danger">{error}</p>
        <button
          onClick={onReset}
          className="rounded-pf-control border border-pf-line-strong bg-pf-surface px-6 py-3 text-sm font-bold text-pf-ink transition-colors hover:bg-pf-surface-subtle"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-pf-panel border border-pf-line bg-pf-surface p-10 shadow-pf-card" role="status">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-3 border-pf-line border-t-pf-accent"></div>
        <p className="font-bold text-pf-ink-muted">
          {processingText}
        </p>
      </div>
    );
  }

  return children;
}

ToolStateWrapper.propTypes = {
  file: PropTypes.object,
  error: PropTypes.string,
  isProcessing: PropTypes.bool,
  processingText: PropTypes.string,
  onFileSelect: PropTypes.func.isRequired,
  onReset: PropTypes.func,
  children: PropTypes.node.isRequired,
};
