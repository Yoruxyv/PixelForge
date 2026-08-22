/**
 * Reusable progress bar for AI and client-side processing flows.
 *
 * Converts numeric progress into an accessible visual indicator and optional
 * status text.
 */

import PropTypes from 'prop-types';

function getStatusLabel(progress) {
  if (progress < 30) return "Uploading to Cloud GPUs...";
  if (progress < 50) return "Analyzing pixel structures...";
  if (progress < 70) return "Running Real-ESRGAN model...";
  if (progress < 90) return "Reconstructing fine details...";
  if (progress < 99) return "Polishing final 4K output...";
  return "Finalizing download...";
}

/**
 * Render a horizontal progress indicator with optional status text.
 *
 * @returns {JSX.Element} Rendered UI.
 */
export default function ProgressBar({ progress, customText }) {
  const displayText = customText || getStatusLabel(progress);

  return (
    <div className="w-full space-y-3" role="status" aria-live="polite">
      <div className="flex items-start justify-between gap-3 text-xs font-semibold text-pf-editorial-muted">
        <span className="whitespace-nowrap">{displayText}</span>
        <span className="shrink-0 font-mono text-pf-editorial-ink">
          {Math.round(progress)}%
        </span>
      </div>
      <div
        className="h-1 w-full bg-pf-editorial-line"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={Math.round(progress)}
      >
        <div
          className="h-1 bg-pf-editorial-accent transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

ProgressBar.propTypes = {
  progress: PropTypes.number.isRequired,
  customText: PropTypes.string, 
};
