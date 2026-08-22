import PropTypes from 'prop-types';

/**
 * @param {Object} props
 * @param {string} [props.cropSizeLabel]
 * @param {boolean} props.canApply
 * @param {Function} props.onCancel
 * @param {Function} props.applyCrop
 * @returns {JSX.Element}
 */
export default function CropHeader({
  cropSizeLabel,
  canApply,
  onCancel,
  applyCrop,
}) {
  return (
    <header className="z-10 flex flex-none items-center justify-between border-b border-pf-editorial-line bg-pf-editorial-surface px-5 py-4 sm:px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-pf-editorial-ink">Focus crop</h2>
        {cropSizeLabel && (
          <span className="hidden font-mono text-[0.65rem] uppercase tracking-wider text-pf-editorial-accent sm:inline-block">
            {cropSizeLabel}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onCancel}
          className="text-sm font-semibold text-pf-editorial-muted transition-colors hover:text-pf-editorial-ink"
        >
          Cancel
        </button>
        <button
          onClick={applyCrop}
          disabled={!canApply}
          className="rounded-pf-control bg-pf-editorial-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pf-accent-hover disabled:cursor-not-allowed disabled:opacity-45"
        >
          Apply Crop
        </button>
      </div>
    </header>
  );
}

CropHeader.propTypes = {
  cropSizeLabel: PropTypes.string,
  canApply: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  applyCrop: PropTypes.func.isRequired,
};

CropHeader.defaultProps = {
  cropSizeLabel: '',
};
