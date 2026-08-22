import PropTypes from 'prop-types';

/**
 * @param {Object} props
 * @param {string} props.id - HTML id for the input
 * @param {string} props.label - Display label
 * @param {number} props.value - Current slider value
 * @param {number} props.min - Minimum value
 * @param {number} props.max - Maximum value
 * @param {number} [props.step] - Step increment (default: 1)
 * @param {Function} props.onChange - Value change handler
 * @param {string|number} props.displayValue - Formatted string to display next to label
 * @returns {JSX.Element}
 */
export default function RangeSlider({ id, label, value, min, max, step = 1, onChange, displayValue }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-pf-editorial-muted">
        <span>{label}</span>
        <span className="font-mono text-pf-editorial-accent">{displayValue}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full appearance-none rounded-lg bg-pf-editorial-line accent-pf-editorial-accent"
      />
    </div>
  );
}

RangeSlider.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  step: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  displayValue: PropTypes.node.isRequired,
};
