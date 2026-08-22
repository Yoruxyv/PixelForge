import React from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import PropTypes from 'prop-types';

import FitModeToggle from '@/shared/components/image-viewer/FitModeToggle';
import Magnifier, {
  ZoomButton,
} from '@/shared/components/image-viewer/Magnifier';
import AspectRatioControls from './AspectRatioControls';
import CropHeader from './CropHeader';

/**
 * @param {Object} props
 * @param {string} props.previewUrl
 * @param {Object} props.crop
 * @param {Function} props.setCrop
 * @param {Function} props.setCompletedCrop
 * @param {number|null|undefined} props.aspect
 * @param {Function} props.applyAspect
 * @param {Function} props.applyCrop
 * @param {boolean} props.canApply
 * @param {string} props.cropSizeLabel
 * @param {Function} props.onImageLoad
 * @param {React.MutableRefObject} props.imgRef
 * @param {string} props.fitMode
 * @param {Function} props.setFitMode
 * @param {Object} props.imageSize
 * @param {number} props.imageSize.width
 * @param {number} props.imageSize.height
 * @param {number} props.imageAspect
 * @param {Function} props.onCancel
 * @param {Function} props.cleanupResult
 * @param {Array<{label: string, value: number|null}>} props.aspectRatioOptions
 * @returns {JSX.Element}
 */
export default function CropEditor({
  previewUrl,
  crop,
  setCrop,
  setCompletedCrop,
  aspect,
  applyAspect,
  applyCrop,
  canApply,
  cropSizeLabel,
  onImageLoad,
  imgRef,
  fitMode,
  setFitMode,
  imageSize,
  imageAspect,
  onCancel,
  cleanupResult,
  aspectRatioOptions,
}) {
  const handleToggleFitMode = () => {
    setFitMode((prev) => (prev === 'fit' ? 'scroll' : 'fit'));
  };

  return (
    <div
      className="crop-workspace-scope relative mx-auto flex h-[calc(100dvh-11rem)] min-h-[36rem] max-h-[52rem] w-full max-w-6xl flex-col overflow-hidden rounded-pf-card border border-pf-editorial-line bg-pf-editorial-footer text-left"
    >
      <CropHeader
        cropSizeLabel={cropSizeLabel}
        canApply={canApply}
        onCancel={onCancel}
        applyCrop={applyCrop}
      />

      <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-pf-editorial-footer">
        <Magnifier
          containerClassName={`flex-1 w-full h-full p-4 sm:p-8 ${
            fitMode === 'fit'
              ? 'flex items-center justify-center overflow-hidden'
              : 'overflow-y-auto overflow-x-hidden custom-scroll block'
          }`}
          innerClassName={
            fitMode === 'fit'
              ? 'flex items-center justify-center w-full h-full'
              : 'w-full h-full'
          }
          renderControls={({ isZoomed, toggleZoom }) => (
            <div className="absolute bottom-6 right-6 z-50 flex gap-2">
              <FitModeToggle
                isFitMode={fitMode === 'fit'}
                onToggle={handleToggleFitMode}
                className="rounded-pf-control border border-pf-editorial-line bg-pf-editorial-surface p-2.5 text-pf-editorial-muted transition-colors hover:border-pf-editorial-muted hover:text-pf-editorial-ink"
                fitTitle="Fit to Screen"
                fillTitle="Switch to Scroll Mode for tall images"
              />
              <ZoomButton
                isZoomed={isZoomed}
                onToggle={toggleZoom}
                className={`rounded-pf-control border p-2.5 transition-colors ${
                  isZoomed
                    ? 'border-pf-editorial-accent bg-pf-editorial-accent text-white'
                    : 'border-pf-editorial-line bg-pf-editorial-surface text-pf-editorial-muted hover:border-pf-editorial-muted hover:text-pf-editorial-ink'
                }`}
              />
            </div>
          )}
        >
          {() => (
            <ReactCrop
              crop={crop}
              onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
              onComplete={(pixelCrop, percentCrop) => {
                setCompletedCrop(percentCrop);
                cleanupResult();
              }}
              aspect={aspect || undefined}
              className={
                fitMode === 'fit' ? 'flex items-center justify-center' : ''
              }
              style={
                fitMode === 'fit'
                  ? {
                      width:
                        imageSize.width > 0
                          ? `calc((100vh - 260px) * ${imageAspect})`
                          : 'auto',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      margin: 'auto',
                    }
                  : {
                      width: '100%',
                      maxWidth: '800px',
                      height: 'max-content',
                      margin: '0 auto',
                      display: 'block',
                    }
              }
            >
              <img
                ref={imgRef}
                alt="Crop preview"
                src={previewUrl}
                onLoad={onImageLoad}
                className={`block ${fitMode === 'scroll' ? 'shadow-2xl' : ''}`}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </ReactCrop>
          )}
        </Magnifier>
      </div>

      <AspectRatioControls
        aspect={aspect}
        onApplyAspect={applyAspect}
        options={aspectRatioOptions}
      />
    </div>
  );
}

CropEditor.propTypes = {
  previewUrl: PropTypes.string.isRequired,
  crop: PropTypes.object,
  setCrop: PropTypes.func.isRequired,
  setCompletedCrop: PropTypes.func.isRequired,
  aspect: PropTypes.number,
  applyAspect: PropTypes.func.isRequired,
  applyCrop: PropTypes.func.isRequired,
  canApply: PropTypes.bool.isRequired,
  cropSizeLabel: PropTypes.string,
  onImageLoad: PropTypes.func.isRequired,
  imgRef: PropTypes.shape({
    current: PropTypes.any,
  }).isRequired,
  fitMode: PropTypes.oneOf(['fit', 'scroll']).isRequired,
  setFitMode: PropTypes.func.isRequired,
  imageSize: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  imageAspect: PropTypes.number.isRequired,
  onCancel: PropTypes.func.isRequired,
  cleanupResult: PropTypes.func.isRequired,
  aspectRatioOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number,
    }),
  ).isRequired,
};

CropEditor.defaultProps = {
  crop: undefined,
  aspect: null,
  cropSizeLabel: '',
};
