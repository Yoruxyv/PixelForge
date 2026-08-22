import PropTypes from 'prop-types';

/**
 * @param {Object} props
 * @param {number|null|undefined} props.aspect
 * @param {Function} props.onApplyAspect
 * @param {Array<{label: string, value: number|null}>} props.options
 * @returns {JSX.Element}
 */
export default function AspectRatioControls({ aspect, onApplyAspect, options }) {
  return (
    <div className="z-10 flex-none overflow-x-auto border-t border-pf-editorial-line bg-pf-editorial-surface p-4">
      <div className="mx-auto flex min-w-max items-center justify-center gap-2 px-2">
        {options.map((option) => {
          const isSelected = aspect === option.value;
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => onApplyAspect(option.value)}
              aria-pressed={isSelected}
              className={`rounded-pf-control border px-4 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
                isSelected
                  ? 'border-pf-editorial-accent bg-pf-editorial-accent-soft text-pf-editorial-accent'
                  : 'border-pf-editorial-line bg-pf-editorial-base text-pf-editorial-muted hover:border-pf-editorial-muted hover:text-pf-editorial-ink'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

AspectRatioControls.propTypes = {
  aspect: PropTypes.number,
  onApplyAspect: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number,
    })
  ).isRequired,
};

AspectRatioControls.defaultProps = {
  aspect: null,
};
