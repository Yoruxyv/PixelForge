import { useRef, useCallback } from 'react';
import { useWorkspaceFile } from '@/shared/hooks/useWorkspaceFile';
import ToolStateWrapper from '@/shared/components/workspace/ToolStateWrapper';
import WorkspaceSuccessCard from './WorkspaceSuccessCard';
import CropEditor from './CropEditor';
import { useImageCrop } from './useImageCrop';

const CROP_ASPECT_RATIOS = [
  { label: 'Free', value: null },
  { label: 'Square (1:1)', value: 1 },
  { label: 'Landscape (16:9)', value: 16 / 9 },
  { label: 'Portrait (9:16)', value: 9 / 16 },
  { label: 'Classic (4:3)', value: 4 / 3 },
  { label: 'Story (3:4)', value: 3 / 4 },
];

/**
 * @returns {JSX.Element}
 */
export default function CropImage() {
  const fileInputRef = useRef(null);

  const {
    file,
    previewUrl,
    setResultBlob,
    resultUrl,
    setResultUrl,
    error,
    setError,
    onFileChange,
    resetAll,
    cleanupResult,
  } = useWorkspaceFile(fileInputRef);

  const {
    imgRef,
    crop,
    setCrop,
    setCompletedCrop,
    aspect,
    isProcessing,
    fitMode,
    setFitMode,
    imageSize,
    onImageLoad,
    applyAspect,
    applyCrop,
    handleReset,
    canApply,
    cropSizeLabel,
    downloadName,
    isFocusMode,
    imageAspect,
  } = useImageCrop({
    file,
    error,
    resultUrl,
    cleanupResult,
    setResultBlob,
    setResultUrl,
    setError,
    resetAll,
  });

  /**
   * @param {File} selectedFile
   * @returns {void}
   */
  const handleFileSelectWrapper = useCallback(
    (selectedFile) => {
      if (selectedFile) {
        onFileChange({ target: { files: [selectedFile] } });
      }
    },
    [onFileChange],
  );

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={onFileChange}
      />
      <section
        className={
          isFocusMode
            ? 'w-full mx-auto px-4 sm:px-6 pt-4 pb-6 relative z-10'
            : 'max-w-6xl mx-auto px-6 pt-4 pb-16 text-center relative z-10'
        }
      >
        <ToolStateWrapper
          file={file}
          error={error}
          isProcessing={isProcessing}
          processingText="Applying precision crop..."
          onFileSelect={handleFileSelectWrapper}
          onReset={handleReset}
        >
          {resultUrl ? (
            <WorkspaceSuccessCard
              title="Crop Successful!"
              description="Your image is ready to use."
              resultUrl={resultUrl}
              downloadName={downloadName}
              onReset={handleReset}
              resetText="Crop Another"
              downloadText="Download Image"
            />
          ) : (
            <CropEditor
              previewUrl={previewUrl}
              crop={crop}
              setCrop={setCrop}
              setCompletedCrop={setCompletedCrop}
              aspect={aspect}
              applyAspect={applyAspect}
              applyCrop={applyCrop}
              canApply={canApply}
              cropSizeLabel={cropSizeLabel}
              onImageLoad={onImageLoad}
              imgRef={imgRef}
              fitMode={fitMode}
              setFitMode={setFitMode}
              imageSize={imageSize}
              imageAspect={imageAspect}
              onCancel={handleReset}
              cleanupResult={cleanupResult}
              aspectRatioOptions={CROP_ASPECT_RATIOS}
            />
          )}
        </ToolStateWrapper>
      </section>
    </div>
  );
}
