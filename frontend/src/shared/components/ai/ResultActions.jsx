import PropTypes from 'prop-types';

/** Export and reset actions for a completed AI result. */
export default function ResultActions({
  resultUrl,
  selectedFile,
  isResultLoaded,
  handleCancel,
  downloadPrefix = 'Result-',
}) {
  if (!resultUrl) return null;

  const baseName = selectedFile?.name?.split('.')[0] || 'image';

  const handleDownload = (event) => {
    if (!isResultLoaded) {
      event.preventDefault();
      return;
    }
    handleCancel();
  };

  return (
    <div className="space-y-2">
      <a
        href={resultUrl}
        download={`${downloadPrefix}${baseName}.png`}
        onClick={handleDownload}
        aria-disabled={!isResultLoaded}
        className={`flex w-full items-center justify-between px-4 py-3 text-sm font-bold transition-colors ${
          isResultLoaded
            ? 'bg-pf-editorial-ink text-pf-editorial-base hover:bg-pf-editorial-accent'
            : 'pointer-events-none bg-pf-editorial-line text-pf-editorial-muted'
        }`}
      >
        <span>{isResultLoaded ? 'Export result' : 'Preparing export'}</span>
        <span aria-hidden="true">↓</span>
      </a>
      <button
        type="button"
        onClick={handleCancel}
        className="w-full border border-pf-editorial-line px-4 py-3 text-sm font-bold text-pf-editorial-muted transition-colors hover:border-pf-editorial-muted hover:text-pf-editorial-ink"
      >
        Start over
      </button>
    </div>
  );
}

ResultActions.propTypes = {
  resultUrl: PropTypes.string,
  selectedFile: PropTypes.shape({ name: PropTypes.string }),
  isResultLoaded: PropTypes.bool,
  handleCancel: PropTypes.func.isRequired,
  downloadPrefix: PropTypes.string,
};
