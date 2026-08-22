import PropTypes from 'prop-types';
import FormatDropdown from '@/shared/components/forms/FormatDropdown';
import { useTextWatermarkEditor } from './useTextWatermarkEditor';
import RichTextWatermarkInput from './RichTextWatermarkInput';
import TextStyleToggles from './TextStyleToggles';
import ColorSwatches from './ColorSwatches';
import RangeSlider from './RangeSlider';

/**
 * Watermark text editor with rich-text formatting support.
 * Serves as the layout composer for the watermark editor components.
 *
 * @param {Object} props
 * @param {Object} props.textWm - Current text watermark state.
 * @param {Function} props.setTextWm - Watermark state updater.
 * @param {string[]} props.fontFamilies - Available font family options.
 * @param {string[]} props.watermarkColors - Available color presets.
 * @returns {JSX.Element}
 */
export default function TextWatermarkControls({
  textWm,
  setTextWm,
  fontFamilies,
  watermarkColors,
}) {
  const { textareaRef, handleTextChange, updateActiveToggles, toggleStyle } =
    useTextWatermarkEditor(textWm, setTextWm);

  return (
    <div className="space-y-3 pb-1">
      <RichTextWatermarkInput
        textWm={textWm}
        textareaRef={textareaRef}
        onTextChange={handleTextChange}
        onInteraction={updateActiveToggles}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col justify-end">
          <FormatDropdown
            value={textWm.fontFamily}
            options={fontFamilies}
            onChange={(val) =>
              setTextWm((prev) => ({ ...prev, fontFamily: val }))
            }
            label="Font Family"
            transform="none"
            labelClassName="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-pf-editorial-muted"
            buttonClassName="h-9 w-full rounded-pf-control border border-pf-editorial-line bg-pf-editorial-base px-3 text-sm font-semibold text-pf-editorial-ink outline-none transition-colors hover:border-pf-editorial-muted"
            getOptionStyle={(opt) => ({ fontFamily: opt })}
          />
        </div>

        <div className="flex flex-col justify-end pb-0.5">
          <TextStyleToggles
            isBold={textWm.isBold}
            isItalic={textWm.isItalic}
            isUnderline={textWm.isUnderline}
            onToggle={toggleStyle}
          />
        </div>
      </div>

      <ColorSwatches
        colors={watermarkColors}
        selectedColor={textWm.color}
        onColorChange={(color) => setTextWm((prev) => ({ ...prev, color }))}
      />

      <div className="grid grid-cols-2 gap-4">
        <RangeSlider
          id="wm-font-size"
          label="Size"
          min={12}
          max={120}
          value={textWm.fontSize}
          onChange={(val) => setTextWm((prev) => ({ ...prev, fontSize: val }))}
          displayValue={`${textWm.fontSize}px`}
        />

        <RangeSlider
          id="wm-text-opacity"
          label="Opacity"
          min={0.1}
          max={1}
          step={0.05}
          value={textWm.opacity}
          onChange={(val) => setTextWm((prev) => ({ ...prev, opacity: val }))}
          displayValue={`${Math.round(textWm.opacity * 100)}%`}
        />
      </div>
    </div>
  );
}

TextWatermarkControls.propTypes = {
  textWm: PropTypes.object.isRequired,
  setTextWm: PropTypes.func.isRequired,
  fontFamilies: PropTypes.arrayOf(PropTypes.string).isRequired,
  watermarkColors: PropTypes.arrayOf(PropTypes.string).isRequired,
};
