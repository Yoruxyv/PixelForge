import PropTypes from "prop-types";
/**
 * Renders the control buttons for rotating and flipping images.
 * * @param {Object} props
 * @param {Function} props.onRotateLeft
 * @param {Function} props.onRotateRight
 * @param {Function} props.onFlipHorizontal
 * @param {Function} props.onFlipVertical
 * @param {boolean} props.disabled
 */
export default function RotateFlipControls({
  onRotateLeft,
  onRotateRight,
  onFlipHorizontal,
  onFlipVertical,
  disabled
}) {
  return (
    <div className={`space-y-6 transition-opacity duration-300 ${disabled ? 'pointer-events-none opacity-40' : 'opacity-100'}`}>
      <div className="border-y border-pf-editorial-line py-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-pf-editorial-muted">Rotate image</h3>
        <div className="flex gap-3">
          <button
            onClick={onRotateLeft}
            className="flex flex-1 flex-col items-center justify-center gap-2 rounded-pf-control border border-pf-editorial-line bg-pf-editorial-base py-3 text-sm font-semibold text-pf-editorial-muted transition-colors hover:border-pf-editorial-accent hover:text-pf-editorial-accent"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Left
          </button>
          <button
            onClick={onRotateRight}
            className="flex flex-1 flex-col items-center justify-center gap-2 rounded-pf-control border border-pf-editorial-line bg-pf-editorial-base py-3 text-sm font-semibold text-pf-editorial-muted transition-colors hover:border-pf-editorial-accent hover:text-pf-editorial-accent"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
            Right
          </button>
        </div>
      </div>

      <div className="border-b border-pf-editorial-line pb-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-pf-editorial-muted">Flip image</h3>
        <div className="flex gap-3">
          <button
            onClick={onFlipHorizontal}
            className="flex flex-1 flex-col items-center justify-center gap-2 rounded-pf-control border border-pf-editorial-line bg-pf-editorial-base py-3 text-sm font-semibold text-pf-editorial-muted transition-colors hover:border-pf-editorial-accent hover:text-pf-editorial-accent"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Horizontal
          </button>
          <button
            onClick={onFlipVertical}
            className="flex flex-1 flex-col items-center justify-center gap-2 rounded-pf-control border border-pf-editorial-line bg-pf-editorial-base py-3 text-sm font-semibold text-pf-editorial-muted transition-colors hover:border-pf-editorial-accent hover:text-pf-editorial-accent"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            Vertical
          </button>
        </div>
      </div>
    </div>
  );
}

RotateFlipControls.propTypes = {
  onRotateLeft: PropTypes.func.isRequired,
  onRotateRight: PropTypes.func.isRequired,
  onFlipHorizontal: PropTypes.func.isRequired,
  onFlipVertical: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};
