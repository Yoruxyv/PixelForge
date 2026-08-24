import { useCallback, useMemo, useRef, useState } from 'react';
import UploadCard from '@/shared/components/upload/UploadCard';
import ToolWorkspaceShell from '@/shared/components/workspace/ToolWorkspaceShell';
import ToolPageWrapper from '@/shared/components/workspace/ToolPageWrapper';
import PreviewImageBox from '@/shared/components/workspace/PreviewImageBox';
import WorkspaceFileSummary from '@/shared/components/workspace/WorkspaceFileSummary';
import WorkspaceErrorAlert from '@/shared/components/workspace/WorkspaceErrorAlert';
import WorkspaceResultDownload from '@/shared/components/workspace/WorkspaceResultDownload';
import WorkspaceActionRow from '@/shared/components/workspace/WorkspaceActionRow';
import ClientSideHeader from '@/shared/components/workspace/ClientSideHeader';
import { useWorkspaceFile } from '@/shared/hooks/useWorkspaceFile';
import { bytesToMB, generateSafeFilename } from '@/shared/lib/fileUtils';
import useImageCompression from './useImageCompression';
import { UPLOAD_POLICIES } from '@/shared/config/imageValidation';
import { validateTargetSize } from './targetSizeCompression';

/** @constant {number} DEFAULT_QUALITY - Default JPEG quality value used for compression. */
const DEFAULT_QUALITY = 0.6;

/**
 * Page component for compressing image files entirely on the client side.
 *
 * Allows users to upload an image, adjust compression strength, preview the
 * compressed output, compare the original and compressed sizes, and download
 * the optimized JPEG result.
 *
 * @returns {JSX.Element}
 */
export default function CompressImage() {
  const fileInputRef = useRef(null);
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [compressionMode, setCompressionMode] = useState('level');
  const [targetSize, setTargetSize] = useState('');
  const [targetTouched, setTargetTouched] = useState(false);

  const {
    file,
    previewUrl,
    resultBlob,
    setResultBlob,
    resultUrl,
    setResultUrl,
    error,
    setError,
    onFileChange,
    resetAll,
    cleanupResult,
  } = useWorkspaceFile(fileInputRef);

  const targetValidation = useMemo(
    () => validateTargetSize(targetSize, file?.size),
    [file?.size, targetSize],
  );

  const {
    isCompressing,
    setIsCompressing,
    compressImage,
    targetResult,
    clearCompressionResult,
  } = useImageCompression({
    file,
    quality,
    mode: compressionMode,
    targetBytes: targetValidation.targetBytes,
    cleanupResult,
    setResultBlob,
    setResultUrl,
    setError,
  });

  const invalidateResult = useCallback(() => {
    cleanupResult();
    clearCompressionResult();
  }, [cleanupResult, clearCompressionResult]);

  /**
   * Resets the full compression workspace, including selected file, preview,
   * generated result, compression status, and slider value.
   */
  const handleReset = useCallback(() => {
    resetAll();
    setQuality(DEFAULT_QUALITY);
    setCompressionMode('level');
    setTargetSize('');
    setTargetTouched(false);
    clearCompressionResult();
    setIsCompressing(false);
  }, [clearCompressionResult, resetAll, setIsCompressing]);

  const handleModeChange = useCallback(
    (mode) => {
      if (mode === compressionMode) return;
      setCompressionMode(mode);
      invalidateResult();
    },
    [compressionMode, invalidateResult],
  );

  const handleQualityChange = useCallback(
    (event) => {
      setQuality(1 - Number(event.target.value));
      invalidateResult();
    },
    [invalidateResult],
  );

  const handleTargetChange = useCallback(
    (event) => {
      setTargetSize(event.target.value);
      setTargetTouched(true);
      invalidateResult();
    },
    [invalidateResult],
  );

  const canCompress = useMemo(
    () =>
      Boolean(file) &&
      !isCompressing &&
      (compressionMode === 'level' || targetValidation.isValid),
    [compressionMode, file, isCompressing, targetValidation.isValid],
  );

  const showTargetError =
    compressionMode === 'target' &&
    Boolean(file) &&
    targetTouched &&
    targetSize.trim() !== '' &&
    !targetValidation.isValid;

  const downloadName = useMemo(
    () => generateSafeFilename(file?.name, 'min', 'jpg'),
    [file?.name],
  );

  const savingsPercent = useMemo(() => {
    if (!file || !resultBlob) return 0;

    const diff = file.size - resultBlob.size;
    if (diff <= 0) return 0;

    return Math.round((diff / file.size) * 100);
  }, [file, resultBlob]);

  return (
    <ToolPageWrapper>
      <ToolWorkspaceShell
        minHeight="min-h-96"
        leftHeader={
          <ClientSideHeader
            category="Optimize / 01"
            title="Compression settings"
            description="Balance JPEG quality and file weight, compare the real sizes, and download the optimized output."
          />
        }
        leftBody={
          <>
            <div className="mb-4">
              <UploadCard
                inputId="compress-file-input"
                inputRef={fileInputRef}
                onChange={onFileChange}
                helperText="Large files welcome · Processed locally in your browser"
                uploadPolicy={UPLOAD_POLICIES.COMPRESSION}
                hasActiveFile={Boolean(file)}
              />
              <WorkspaceFileSummary file={file} />
            </div>

            <div className="mb-5">
              <p
                id="compression-mode-label"
                className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-pf-editorial-muted"
              >
                Compress by
              </p>
              <div
                role="group"
                aria-labelledby="compression-mode-label"
                className="flex border border-pf-editorial-line bg-pf-editorial-base p-1"
              >
                <button
                  type="button"
                  aria-pressed={compressionMode === 'level'}
                  onClick={() => handleModeChange('level')}
                  className={`flex-1 rounded-pf-control px-3 py-2 text-xs font-semibold transition-colors ${
                    compressionMode === 'level'
                      ? 'bg-pf-editorial-accent-soft text-pf-editorial-accent'
                      : 'text-pf-editorial-muted hover:text-pf-editorial-ink'
                  }`}
                >
                  Compression Level
                </button>
                <button
                  type="button"
                  aria-pressed={compressionMode === 'target'}
                  onClick={() => handleModeChange('target')}
                  className={`flex-1 rounded-pf-control px-3 py-2 text-xs font-semibold transition-colors ${
                    compressionMode === 'target'
                      ? 'bg-pf-editorial-accent-soft text-pf-editorial-accent'
                      : 'text-pf-editorial-muted hover:text-pf-editorial-ink'
                  }`}
                >
                  Target Size
                </button>
              </div>
            </div>

            {compressionMode === 'level' ? (
              <div className="mb-4 flex flex-col justify-center">
                <label htmlFor="compression-range" className="mb-4 flex w-full items-center justify-between text-sm font-semibold text-pf-editorial-ink">
                  <span>Compression Level</span>
                  <span className="font-mono text-pf-editorial-accent">
                    {Math.round((1 - quality) * 100)}%
                  </span>
                </label>

                <div className="px-1 pt-1">
                  <input
                    id="compression-range"
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={1 - quality}
                    onChange={handleQualityChange}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-pf-editorial-line accent-pf-editorial-accent"
                  />

                  <div className="mt-2 flex w-full justify-between text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-pf-editorial-muted">
                    <span>High Quality</span>
                    <span>Small File</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label
                    htmlFor="compression-target-size"
                    className="text-sm font-semibold text-pf-editorial-ink"
                  >
                    Target size
                  </label>
                  {file && (
                    <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-pf-editorial-muted">
                      Original {bytesToMB(file.size)} MB
                    </span>
                  )}
                </div>
                <div className="flex w-full items-center overflow-hidden rounded-lg border border-pf-editorial-line bg-pf-editorial-base transition-shadow focus-within:border-pf-editorial-accent focus-within:ring-2 focus-within:ring-pf-editorial-accent/35">
                  <input
                    id="compression-target-size"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    value={targetSize}
                    onChange={handleTargetChange}
                    onBlur={() => setTargetTouched(true)}
                    aria-invalid={showTargetError}
                    aria-describedby={`compression-target-help${
                      showTargetError ? ' compression-target-error' : ''
                    }`}
                    data-focus-ring="none"
                    className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm text-pf-editorial-ink outline-none"
                  />
                  <span className="border-l border-pf-editorial-line px-3 py-2.5 text-xs font-semibold text-pf-editorial-muted">
                    MB
                  </span>
                </div>
                <p
                  id="compression-target-help"
                  className="mt-2 text-xs leading-relaxed text-pf-editorial-muted"
                >
                  Aim for the highest JPEG quality at or below this size.
                </p>
                {showTargetError && (
                  <p
                    id="compression-target-error"
                    role="alert"
                    className="mt-2 text-xs font-medium text-pf-danger"
                  >
                    Target must be smaller than the original file (
                    {bytesToMB(file.size)} MB).
                  </p>
                )}
              </div>
            )}

            <WorkspaceErrorAlert error={error} />
          </>
        }
        leftFooter={
          <WorkspaceActionRow
            primaryLabel={isCompressing ? 'Compressing...' : 'Compress Image'}
            secondaryLabel="Reset"
            onPrimaryClick={compressImage}
            onSecondaryClick={handleReset}
            primaryDisabled={!canCompress}
          />
        }
        rightHeader={
          <h2 className="flex items-center justify-between gap-4 text-sm font-semibold text-pf-editorial-ink">
            Output preview
            {resultBlob && savingsPercent > 0 && (
              <span className="font-mono text-[0.65rem] uppercase tracking-wider text-pf-success">
                Saved {savingsPercent}%
              </span>
            )}
          </h2>
        }
        rightBody={
          <div className="absolute inset-2 flex flex-col">
            <PreviewImageBox
              previewUrl={previewUrl}
              resultUrl={resultUrl}
              resultAlt="Compressed output preview"
            />
            {targetResult && resultBlob && (
              <div
                aria-live="polite"
                className="mt-3 border-t border-pf-editorial-line pt-3 text-xs"
              >
                <p className="font-mono font-semibold text-pf-editorial-ink">
                  Target {bytesToMB(targetResult.targetBytes)} MB · Output{' '}
                  {bytesToMB(resultBlob.size)} MB
                </p>
                <p
                  className={`mt-1.5 ${
                    targetResult.targetReached
                      ? 'text-pf-editorial-muted'
                      : 'font-medium text-pf-warning'
                  }`}
                >
                  {targetResult.targetReached
                    ? `Quality used: ${Math.round(targetResult.quality * 100)}%`
                    : `Target could not be reached without resizing the image. Best effort: ${bytesToMB(resultBlob.size)} MB at ${Math.round(targetResult.quality * 100)}% quality.`}
                </p>
              </div>
            )}
            <WorkspaceResultDownload
              resultUrl={resultUrl}
              resultBlob={resultBlob}
              originalFile={file}
              downloadName={downloadName}
              downloadLabel="Download Compressed Image"
            />
          </div>
        }
      />
    </ToolPageWrapper>
  );
}
