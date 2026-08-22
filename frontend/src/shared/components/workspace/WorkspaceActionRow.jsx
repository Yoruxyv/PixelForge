import PropTypes from 'prop-types';

/**
 * Renders a reusable action button row for primary/secondary workspace actions.
 * @param {{
 * primaryLabel: string,
 * secondaryLabel?: string,
 * onPrimaryClick: () => void,
 * onSecondaryClick?: () => void,
 * primaryDisabled?: boolean,
 * secondaryDisabled?: boolean,
 * primaryType?: 'button' | 'submit' | 'reset',
 * secondaryType?: 'button' | 'submit' | 'reset',
 * className?: string
 * }} props
 * @returns {JSX.Element}
 */
export default function WorkspaceActionRow({
  primaryLabel,
  secondaryLabel,
  onPrimaryClick,
  onSecondaryClick,
  primaryDisabled = false,
  secondaryDisabled = false,
  primaryType = 'button',
  secondaryType = 'button',
  className = 'flex flex-col gap-3 sm:flex-row',
}) {
  return (
    <div className={className}>
      <button
        type={primaryType}
        onClick={onPrimaryClick}
        disabled={primaryDisabled}
        className="inline-flex flex-1 items-center justify-center rounded-pf-control bg-pf-editorial-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-pf-accent-hover disabled:cursor-not-allowed disabled:opacity-45"
      >
        {primaryLabel}
      </button>

      {secondaryLabel && onSecondaryClick ? (
        <button
          type={secondaryType}
          onClick={onSecondaryClick}
          disabled={secondaryDisabled}
          className="inline-flex items-center justify-center rounded-pf-control border border-pf-editorial-line bg-transparent px-5 py-3 text-sm font-semibold text-pf-editorial-muted transition-colors hover:border-pf-editorial-muted hover:text-pf-editorial-ink disabled:cursor-not-allowed disabled:opacity-45"
        >
          {secondaryLabel}
        </button>
      ) : null}
    </div>
  );
}

WorkspaceActionRow.propTypes = {
  primaryLabel: PropTypes.string.isRequired,
  secondaryLabel: PropTypes.string,
  onPrimaryClick: PropTypes.func.isRequired,
  onSecondaryClick: PropTypes.func,
  primaryDisabled: PropTypes.bool,
  secondaryDisabled: PropTypes.bool,
  primaryType: PropTypes.oneOf(['button', 'submit', 'reset']),
  secondaryType: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};
