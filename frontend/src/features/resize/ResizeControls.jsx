import { MaxDimension } from './useImageResize';
import PropTypes from 'prop-types';

const RESIZE_PRESETS = [
  { label: 'IG Square', width: 1080, height: 1080 },
  { label: 'IG Story / TikTok', width: 1080, height: 1920 },
  { label: 'Social Post', width: 1200, height: 630 },
  { label: 'Full HD (1080p)', width: 1920, height: 1080 },
  { label: 'HD (720p)', width: 1280, height: 720 },
  { label: 'Standard SD', width: 640, height: 480 },
];

/**
 * @param {Object} props
 * @param {number} props.origWidth
 * @param {number} props.origHeight
 * @param {string|number} props.targetWidth
 * @param {string|number} props.targetHeight
 * @param {boolean} props.lockAspect
 * @param {Function} props.onWidthChange
 * @param {Function} props.onHeightChange
 * @param {Function} props.onToggleLock
 * @param {Function} props.onApplyPreset
 * @param {boolean} props.disabled
 */
export default function ResizeControls({
  origWidth,
  origHeight,
  targetWidth,
  targetHeight,
  lockAspect,
  onWidthChange,
  onHeightChange,
  onToggleLock,
  onApplyPreset,
  disabled,
}) {
  return (
    <div
      className={`space-y-6 transition-opacity duration-300 ${disabled ? 'pointer-events-none opacity-40' : 'opacity-100'}`}
    >
      <div className="border-y border-pf-editorial-line py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-pf-editorial-muted">
            Custom Dimensions
          </h3>
          {origWidth > 0 && (
            <span className="font-mono text-[0.6rem] uppercase tracking-wider text-pf-editorial-muted">
              Original: {origWidth} x {origHeight}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <label
              htmlFor="targetWidth"
              className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-wider text-pf-editorial-muted"
            >
              Width
            </label>
            <input
              id="targetWidth"
              type="number"
              value={targetWidth}
              onChange={onWidthChange}
              min="1"
              max={MaxDimension}
              placeholder="Width"
              className="h-10 w-full rounded-pf-control border border-pf-editorial-line bg-pf-editorial-base px-3 pr-8 text-sm font-semibold text-pf-editorial-ink outline-none transition-colors hover:border-pf-editorial-muted"
            />
            <span className="pointer-events-none absolute bottom-2.5 right-3 text-xs font-semibold text-pf-editorial-muted">
              px
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleLock}
            title={lockAspect ? 'Unlock Aspect Ratio' : 'Lock Aspect Ratio'}
            aria-label={lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
            aria-pressed={lockAspect}
            className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
              lockAspect
                ? 'bg-pf-editorial-accent-soft text-pf-editorial-accent'
                : 'border border-pf-editorial-line bg-pf-editorial-base text-pf-editorial-muted hover:text-pf-editorial-ink'
            }`}
          >
            {lockAspect ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          <div className="flex-1 relative">
            <label
              htmlFor="targetHeight"
              className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-wider text-pf-editorial-muted"
            >
              Height
            </label>
            <input
              id="targetHeight"
              type="number"
              value={targetHeight}
              onChange={onHeightChange}
              min="1"
              max={MaxDimension}
              placeholder="Height"
              className="h-10 w-full rounded-pf-control border border-pf-editorial-line bg-pf-editorial-base px-3 pr-8 text-sm font-semibold text-pf-editorial-ink outline-none transition-colors hover:border-pf-editorial-muted"
            />
            <span className="pointer-events-none absolute bottom-2.5 right-3 text-xs font-semibold text-pf-editorial-muted">
              px
            </span>
          </div>
        </div>

        <div className="mt-5 border-t border-pf-editorial-line pt-4">
          <h3 className="mb-3 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-pf-editorial-muted">
            Quick Presets
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {RESIZE_PRESETS.map((preset) => {
              const isSelected =
                Number(targetWidth) === preset.width &&
                Number(targetHeight) === preset.height;
              return (
                <button
                  key={preset.label}
                  onClick={() => onApplyPreset(preset.width, preset.height)}
                  className={`flex flex-col items-start px-3 py-2 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-pf-editorial-accent bg-pf-editorial-accent-soft'
                      : 'border-pf-editorial-line bg-pf-editorial-base hover:border-pf-editorial-muted'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold ${isSelected ? 'text-pf-editorial-accent' : 'text-pf-editorial-ink'}`}
                  >
                    {preset.label}
                  </span>
                  <span
                    className="mt-0.5 font-mono text-[0.6rem] text-pf-editorial-muted"
                  >
                    {preset.width} × {preset.height} px
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

ResizeControls.propTypes = {
  origWidth: PropTypes.number.isRequired,
  origHeight: PropTypes.number.isRequired,
  targetWidth: PropTypes.string.isRequired,
  targetHeight: PropTypes.string.isRequired,
  lockAspect: PropTypes.bool.isRequired,
  onWidthChange: PropTypes.func.isRequired,
  onHeightChange: PropTypes.func.isRequired,
  onToggleLock: PropTypes.func.isRequired,
  onApplyPreset: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};
