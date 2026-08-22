import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FitModeToggle from '@/shared/components/image-viewer/FitModeToggle';
import Magnifier, {
  ZoomButton,
} from '@/shared/components/image-viewer/Magnifier';

/**
 * Inner content logic for the interactive before/after image comparison slider.
 * * @param {Object} props
 * @param {string} props.originalImage - Object URL of the baseline image.
 * @param {string} props.processedImage - Object URL of the output image.
 * @param {Function} [props.onImageLoad] - Callback when the processed image finishes rendering.
 * @param {string} [props.originalLabel='Original'] - Text badge for the left side.
 * @param {string} [props.resultLabel='Result'] - Text badge for the right side.
 * @param {boolean} [props.isHighRes=false] - Flag confirming if the image is high-resolution.
 * @returns {JSX.Element}
 */
function ResultViewerContent({
  originalImage,
  processedImage,
  onImageLoad,
  originalLabel = 'Original',
  resultLabel = 'Result',
  isHighRes = false,
  canvasClassName = '',
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingText, setLoadingText] = useState('Downloading Results...');
  const [fitMode, setFitMode] = useState('contain');

  useEffect(() => {
    if (isLoaded) return undefined;

    const initialTimeout = setTimeout(() => {
      setLoadingText(
        isHighRes
          ? 'High-resolution file detected. Almost there...'
          : 'Wrapping things up. Almost ready...',
      );
    }, 3000);

    const slowNetworkTimeout = setTimeout(() => {
      setLoadingText(
        'Loading is taking a bit longer than usual. Thanks for your patience!',
      );
    }, 8000);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(slowNetworkTimeout);
    };
  }, [isLoaded, isHighRes]);

  const handleProcessedLoad = () => {
    setIsLoaded(true);
    if (typeof onImageLoad === 'function') onImageLoad();
  };

  const toggleFitMode = (e) => {
    if (e) e.stopPropagation();
    setFitMode((prev) => (prev === 'cover' ? 'contain' : 'cover'));
  };

  const fitClass =
    fitMode === 'cover'
      ? 'object-cover object-top'
      : 'object-contain';

  return (
    <Magnifier
      containerClassName={`group relative flex min-h-[26rem] h-full w-full items-center justify-center overflow-hidden bg-pf-editorial-raised ${canvasClassName}`}
      innerClassName="relative w-full h-full"
      renderControls={({ isZoomed, toggleZoom }) => (
        <>
          {!isLoaded && (
            <div className="pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center bg-pf-editorial-base/90 px-4 text-center">
              <div className="mb-4 h-8 w-8 animate-spin border-2 border-pf-editorial-line border-t-pf-editorial-accent" />
              <p className="text-sm font-bold text-pf-editorial-ink">
                {loadingText}
              </p>
            </div>
          )}
          <div className="absolute bottom-4 right-4 z-50 flex gap-2 opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
            <FitModeToggle
              isFitMode={fitMode === 'contain'}
              onToggle={toggleFitMode}
              fitTitle="Show full image"
              fillTitle="Fill container"
              className="border border-pf-editorial-line bg-pf-editorial-base/90 p-2 text-pf-editorial-muted transition-colors hover:border-pf-editorial-accent hover:text-pf-editorial-ink"
            />
            <ZoomButton
              isZoomed={isZoomed}
              onToggle={toggleZoom}
              className={`border p-2 transition-colors ${
                isZoomed
                  ? 'border-pf-editorial-accent bg-pf-editorial-accent-soft text-pf-editorial-ink'
                  : 'border-pf-editorial-line bg-pf-editorial-base/90 text-pf-editorial-muted hover:border-pf-editorial-accent hover:text-pf-editorial-ink'
              }`}
            />
          </div>
        </>
      )}
    >
      {({ isZoomed }) => (
        <>
          <img
            src={processedImage}
            alt="Processed result"
            className={`absolute inset-0 h-full w-full ${fitClass}`}
            onLoad={handleProcessedLoad}
            onError={() => setIsLoaded(false)}
          />

          <div
            className="pointer-events-none absolute right-3 top-3 z-20 border border-pf-editorial-line bg-pf-editorial-ink px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-pf-editorial-base transition-transform"
            style={{
              transform: isZoomed ? 'scale(0.4)' : 'scale(1)',
              transformOrigin: 'top right',
            }}
          >
            {resultLabel}
          </div>

          <div
            className="pointer-events-none absolute left-3 top-3 z-20 border border-pf-editorial-line bg-pf-editorial-base/90 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-pf-editorial-ink transition-transform"
            style={{
              transform: isZoomed ? 'scale(0.4)' : 'scale(1)',
              transformOrigin: 'top left',
            }}
          >
            {originalLabel}
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-10 h-full w-full"
            style={{
              clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
            }}
          >
            <img
              src={originalImage}
              alt="Original input"
              className={`pointer-events-auto absolute inset-0 h-full w-full ${fitClass}`}
            />
          </div>

          <div
            className="pointer-events-none absolute bottom-0 top-0 z-30 w-px bg-pf-editorial-accent"
            style={{ left: `${sliderPosition}%` }}
          >
            <div
              className="absolute top-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-pf-editorial-accent bg-pf-editorial-ink text-pf-editorial-base transition-transform"
              style={{
                left: '0',
                marginLeft: '-14px',
                transform: isZoomed
                  ? 'translateY(-50%) scale(0.4)'
                  : 'translateY(-50%) scale(1)',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-pf-editorial-base"
              >
                <path d="M9 18l-6-6 6-6" />
                <path d="M15 6l6 6-6 6" />
              </svg>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize m-0 z-40"
            aria-label="Adjust comparison position"
          />
        </>
      )}
    </Magnifier>
  );
}

ResultViewerContent.propTypes = {
  originalImage: PropTypes.string.isRequired,
  processedImage: PropTypes.string.isRequired,
  onImageLoad: PropTypes.func,
  originalLabel: PropTypes.string,
  resultLabel: PropTypes.string,
  isHighRes: PropTypes.bool,
  canvasClassName: PropTypes.string,
};

/**
 * Wrapper for the result viewer that forces re-mounts when the processed image changes.
 * * @param {Object} props - Inherits props from ResultViewerContent.
 * @returns {JSX.Element}
 */
export default function ResultViewer(props) {
  return <ResultViewerContent key={props.processedImage} {...props} />;
}

ResultViewer.propTypes = { ...ResultViewerContent.propTypes };
