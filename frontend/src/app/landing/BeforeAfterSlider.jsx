/**
 * Interactive before/after image comparison component.
 *
 * Used on landing and marketing sections to show the visible difference between
 * an original image and the processed PixelForge result.
 */

import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Render a draggable before/after comparison slider.
 *
 * @returns {JSX.Element} Rendered UI.
 */
const BeforeAfterSlider = ({
  beforeImage,
  afterImage,
  altText = 'Before and after comparison',
  aspectClassName = 'aspect-video',
  imageClassName = 'object-cover',
  canvasClassName = 'bg-pf-editorial-raised',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleSliderChange = (event) => {
    setSliderPosition(event.target.value);
  };

  return (
    <div className={`relative w-full select-none overflow-hidden ${canvasClassName} ${aspectClassName}`}>
      <img
        src={afterImage}
        alt={`${altText} - After`}
        className={`pointer-events-none absolute inset-0 h-full w-full ${imageClassName}`}
        loading="lazy"
      />

      <img
        src={beforeImage}
        alt={`${altText} - Before`}
        className={`pointer-events-none absolute inset-0 h-full w-full ${imageClassName}`}
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        loading="lazy"
      />

      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-pf-editorial-accent shadow-lg"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
      >
        <div className="absolute left-1/2 top-1/2 -ml-4 -mt-4 flex h-8 w-8 items-center justify-center rounded-full border border-pf-editorial-accent bg-pf-editorial-ink text-pf-editorial-base shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18-6-6 6-6"/>
            <path d="m15 18 6-6-6-6"/>
          </svg>
        </div>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={handleSliderChange}
        className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
        aria-label="Image comparison slider"
      />
    </div>
  );
};

BeforeAfterSlider.propTypes = {
  beforeImage: PropTypes.string.isRequired,
  afterImage: PropTypes.string.isRequired,
  altText: PropTypes.string,
  aspectClassName: PropTypes.string,
  imageClassName: PropTypes.string,
  canvasClassName: PropTypes.string,
};

export default BeforeAfterSlider;
