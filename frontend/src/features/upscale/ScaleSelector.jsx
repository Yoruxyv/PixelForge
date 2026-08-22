import PropTypes from 'prop-types';

/**
 * Renders the primary action buttons, scale selection, and Turnstile integration for upscaling.
 * @param {Object} props - The component props.
 * @param {string|null} props.jobId - The current active job ID if processing.
 * @param {boolean} props.isProcessing - Whether a job is currently actively processing.
 * @param {Function} props.handleCancel - Callback to cancel the current job or clear workspace.
 * @param {Function} props.handleUpscale - Callback to trigger the upscale process.
 * @param {number} props.scale - The currently selected scale multiplier (1, 2, 3, or 4).
 * @param {Function} props.setScale - Callback to update the selected scale multiplier.
 * @returns {JSX.Element}
 */
export default function ScaleSelector({
  jobId,
  isProcessing,
  handleCancel,
  handleUpscale,
  scale,
  setScale,
}) {
  const isSubmitDisabled = isProcessing || !!jobId;

  const renderButtonContent = () => {
    if (isProcessing || jobId) return 'Processing...';
    return 'Upscale Image';
  };

  return (
    <div className="w-full space-y-5">
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-pf-editorial-muted">
            Output scale
          </span>
          <span className="font-mono text-xs text-pf-editorial-accent">{scale}×</span>
        </div>
        <div className="grid grid-cols-4 border border-pf-editorial-line">
          {[1, 2, 3, 4].map((mult) => (
            <button
              type="button"
              key={mult}
              onClick={() => setScale(mult)}
              disabled={isSubmitDisabled}
              aria-pressed={scale === mult}
              className={`border-r border-pf-editorial-line px-2 py-2.5 text-sm font-bold transition-colors last:border-r-0 ${
                scale === mult
                  ? 'bg-pf-editorial-accent-soft text-pf-editorial-ink'
                  : 'text-pf-editorial-muted hover:bg-pf-editorial-raised hover:text-pf-editorial-ink'
              } disabled:opacity-50`}
            >
              {mult}x
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isProcessing}
          className="border border-pf-editorial-line px-4 py-3 text-sm font-bold text-pf-editorial-muted transition-colors hover:border-pf-editorial-muted hover:text-pf-editorial-ink disabled:opacity-50"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={handleUpscale}
          disabled={isSubmitDisabled}
          className="flex flex-1 items-center justify-center bg-pf-editorial-ink px-4 py-3 text-sm font-bold text-pf-editorial-base transition-colors hover:bg-pf-editorial-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {renderButtonContent()}
        </button>
      </div>
    </div>
  );
}

ScaleSelector.propTypes = {
  jobId: PropTypes.string,
  isProcessing: PropTypes.bool.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpscale: PropTypes.func.isRequired,
  scale: PropTypes.number.isRequired,
  setScale: PropTypes.func.isRequired,
};
