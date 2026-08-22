import PropTypes from 'prop-types';

/**
 * @param {Object} props
 * @param {boolean} props.isBold - Active state for bold
 * @param {boolean} props.isItalic - Active state for italic
 * @param {boolean} props.isUnderline - Active state for underline
 * @param {Function} props.onToggle - Handler passing the style key ('b', 'i', 'u')
 * @returns {JSX.Element}
 */
export default function TextStyleToggles({ isBold, isItalic, isUnderline, onToggle }) {
  const getBtnClass = (isActive) => 
    `rounded-pf-control text-sm transition-colors ${isActive ? 'bg-pf-editorial-accent-soft text-pf-editorial-accent' : 'text-pf-editorial-muted hover:bg-pf-editorial-raised hover:text-pf-editorial-ink'}`;

  return (
    <div className="grid h-9 grid-cols-3 gap-1 border border-pf-editorial-line bg-pf-editorial-base p-1">
      <button
        type="button"
        onPointerDown={(e) => { e.preventDefault(); onToggle('b'); }}
        aria-pressed={isBold}
        aria-label="Bold watermark text"
        className={`${getBtnClass(isBold)} font-bold`}
      >
        B
      </button>
      <button
        type="button"
        onPointerDown={(e) => { e.preventDefault(); onToggle('i'); }}
        aria-pressed={isItalic}
        aria-label="Italic watermark text"
        className={getBtnClass(isItalic)}
      >
        <span className="italic">I</span>
      </button>
      <button
        type="button"
        onPointerDown={(e) => { e.preventDefault(); onToggle('u'); }}
        aria-pressed={isUnderline}
        aria-label="Underline watermark text"
        className={getBtnClass(isUnderline)}
      >
        <span className="underline">U</span>
      </button>
    </div>
  );
}

TextStyleToggles.propTypes = {
  isBold: PropTypes.bool,
  isItalic: PropTypes.bool,
  isUnderline: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
};
