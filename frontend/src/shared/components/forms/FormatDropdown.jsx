import { useId } from 'react';
import PropTypes from 'prop-types';

/**
 * Native format selector with complete keyboard and platform accessibility.
 * @returns {JSX.Element}
 */
export default function FormatDropdown({
  value,
  options,
  onChange,
  label = 'Convert To',
  transform = 'uppercase',
  labelClassName = 'mb-2 block text-xs font-semibold text-pf-editorial-muted',
  buttonClassName = 'w-full rounded-pf-control border border-pf-editorial-line bg-pf-editorial-base px-3 py-2.5 text-sm font-semibold text-pf-editorial-ink outline-none transition-colors hover:border-pf-editorial-muted',
  getOptionStyle = () => ({}),
  optionClassName = '',
}) {
  const selectId = useId();
  const formatText = (text) => {
    if (transform === 'uppercase') return String(text).toUpperCase();
    if (transform === 'lowercase') return String(text).toLowerCase();
    return String(text);
  };

  return (
    <div>
      {label ? (
        <label htmlFor={selectId} className={labelClassName}>
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={buttonClassName}
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
            style={getOptionStyle(option)}
            className={optionClassName}
          >
            {formatText(option)}
          </option>
        ))}
      </select>
    </div>
  );
}

FormatDropdown.propTypes = {
  value: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  transform: PropTypes.oneOf(['uppercase', 'lowercase', 'none']),
  labelClassName: PropTypes.string,
  buttonClassName: PropTypes.string,
  getOptionStyle: PropTypes.func,
  optionClassName: PropTypes.string,
};
