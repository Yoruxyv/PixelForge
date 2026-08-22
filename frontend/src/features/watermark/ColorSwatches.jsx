import PropTypes from 'prop-types';

/**
 * @param {Object} props
 * @param {string[]} props.colors - Array of hex color strings
 * @param {string} props.selectedColor - Currently selected hex color
 * @param {Function} props.onColorChange - Color change handler
 * @returns {JSX.Element}
 */
export default function ColorSwatches({ colors, selectedColor, onColorChange }) {
  const isCustomColor = !colors.includes(selectedColor);

  return (
    <div>
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-pf-editorial-muted">
        Text Color
      </h3>
      <div className="flex flex-wrap items-center gap-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onColorChange(color)}
            aria-label={`Use ${color} for watermark text`}
            aria-pressed={selectedColor === color}
            className={`h-7 w-7 shrink-0 rounded-full transition-transform ${selectedColor === color ? 'ring-2 ring-pf-editorial-accent ring-offset-2 ring-offset-pf-editorial-surface' : 'border border-pf-editorial-line hover:scale-105'}`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}

        <div
          className={`relative flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform ${isCustomColor ? 'ring-2 ring-pf-editorial-accent ring-offset-2 ring-offset-pf-editorial-surface' : 'border border-pf-editorial-line hover:scale-105'}`}
          style={{ background: isCustomColor ? 'linear-gradient(to top right, #fb7185, #d946ef, #6366f1)' : selectedColor }}
          title="Custom color"
        >
          <input
            aria-label="Custom text color"
            type="color"
            value={selectedColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
      </div>
    </div>
  );
}

ColorSwatches.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedColor: PropTypes.string.isRequired,
  onColorChange: PropTypes.func.isRequired,
};
