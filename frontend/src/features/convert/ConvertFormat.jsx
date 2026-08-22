import { useCallback, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FILE_LIMITS } from '@/shared/config/imageValidation';
import AppModals from '@/shared/components/common/AppModals';
import FormatDropdown from '@/shared/components/forms/FormatDropdown';
import UploadCard from '@/shared/components/upload/UploadCard';
import ToolWorkspaceShell from '@/shared/components/workspace/ToolWorkspaceShell';
import ToolPageWrapper from '@/shared/components/workspace/ToolPageWrapper';
import PreviewImageBox from '@/shared/components/workspace/PreviewImageBox';
import WorkspaceFileSummary from '@/shared/components/workspace/WorkspaceFileSummary';
import WorkspaceErrorAlert from '@/shared/components/workspace/WorkspaceErrorAlert';
import WorkspaceActionRow from '@/shared/components/workspace/WorkspaceActionRow';
import ClientSideHeader from '@/shared/components/workspace/ClientSideHeader';
import { useWorkspaceFile } from '@/shared/hooks/useWorkspaceFile';
import {
  bytesToMB,
  generateSafeFilename,
  isSameExtension,
} from '@/shared/lib/fileUtils';
import useImageConversion from './useImageConversion';

/** @constant {string} DEFAULT_FORMAT - Default target format on mount and after reset. */
const DEFAULT_FORMAT = 'png';

/** @constant {number} DEFAULT_QUALITY - Default quality value (0–1 scale) on mount and after reset. */
const DEFAULT_QUALITY = 0.92;

/**
 * Page component for converting image formats entirely on the client side.
 *
 * Allows users to upload an image, select a target format, adjust output
 * quality, and download the converted result. Resetting clears only the
 * conversion output and control settings — the uploaded file is preserved
 * so the user can convert to a different format without re-uploading.
 *
 * Attempting to convert a file to the same format it was uploaded in opens
 * a confirmation modal rather than proceeding with a no-op conversion.
 *
 * @returns {JSX.Element}
 */
export default function ConvertFormat() {
  const fileInputRef = useRef(null);

  const [targetFormat, setTargetFormat] = useState(DEFAULT_FORMAT);
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    cleanupResult,
  } = useWorkspaceFile(fileInputRef);

  const { isConverting, setIsConverting, convertImage } = useImageConversion({
    file,
    targetFormat,
    quality,
    cleanupResult,
    setResultBlob,
    setResultUrl,
    setError,
  });

  /**
   * Handles the convert button click. Opens a warning modal if the selected
   * target format matches the uploaded file's current extension, otherwise
   * proceeds with the conversion.
   */
  const handleConvertClick = useCallback(() => {
    if (!file) return;

    if (isSameExtension(file.name, targetFormat)) {
      setIsModalOpen(true);
      return;
    }

    convertImage();
  }, [file, targetFormat, convertImage]);

  /**
   * Resets the conversion output, format selection, and quality slider back
   * to their defaults. The uploaded file and its preview are intentionally
   * preserved so the user can adjust settings and re-convert without
   * re-uploading.
   */
  const handleReset = useCallback(() => {
    cleanupResult();
    setResultBlob(null);
    setResultUrl(null);
    setError(null);
    setTargetFormat(DEFAULT_FORMAT);
    setQuality(DEFAULT_QUALITY);
    setIsConverting(false);
  }, [cleanupResult, setResultBlob, setResultUrl, setError, setIsConverting]);

  const canConvert = useMemo(
    () => Boolean(file) && !isConverting,
    [file, isConverting],
  );
  const downloadName = useMemo(
    () => generateSafeFilename(file?.name, 'converted', targetFormat),
    [file?.name, targetFormat],
  );

  return (
    <ToolPageWrapper>
      <ToolWorkspaceShell
        minHeight="min-h-96"
        leftHeader={
          <ClientSideHeader
            category="Optimize / 02"
            title="Output settings"
            description="Choose a new image format and quality while keeping the source available for another conversion."
          />
        }
        leftBody={
          <>
            <div className="mb-4">
              <UploadCard
                inputId="convert-file-input"
                inputRef={fileInputRef}
                onChange={onFileChange}
                helperText={`Any format up to ${FILE_LIMITS.MAX_FILE_SIZE_MB}MB`}
                hasActiveFile={Boolean(file)}
              />
              <WorkspaceFileSummary file={file} />
            </div>

            <div className="mb-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormatDropdown
                value={targetFormat}
                options={FILE_LIMITS.ALLOWED_EXTENSIONS}
                onChange={setTargetFormat}
                label="Convert To"
                buttonClassName="w-full rounded-pf-control border border-pf-editorial-line bg-pf-editorial-base px-3 py-2.5 text-sm font-semibold text-pf-editorial-ink outline-none transition-colors hover:border-pf-editorial-muted"
                optionClassName="font-bold"
              />

              <div
                className={`flex flex-col justify-center transition-opacity duration-300 ${targetFormat === 'png' ? 'pointer-events-none opacity-30' : 'opacity-100'}`}
              >
                <label htmlFor="quality-range" className="mb-2 flex w-full items-center justify-between text-sm font-semibold text-pf-editorial-ink">
                  <span>Quality</span>
                  <span className="font-mono text-pf-editorial-accent">
                    {Math.round(quality * 100)}%
                  </span>
                </label>
                <div className="pt-1">
                  <input
                    id="quality-range"
                    type="range"
                    min="0.6"
                    max="1"
                    step="0.01"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-pf-editorial-line accent-pf-editorial-accent"
                  />
                </div>
              </div>
            </div>

            <WorkspaceErrorAlert error={error} />
          </>
        }
        leftFooter={
          <WorkspaceActionRow
            primaryLabel={isConverting ? 'Converting...' : 'Convert Image'}
            secondaryLabel="Reset"
            onPrimaryClick={handleConvertClick}
            onSecondaryClick={handleReset}
            primaryDisabled={!canConvert}
          />
        }
        rightHeader={
          <h2 className="flex items-center justify-between gap-4 text-sm font-semibold text-pf-editorial-ink">
            Output preview
            {resultBlob && (
              <span className="font-mono text-[0.65rem] uppercase tracking-wider text-pf-success">
                Ready: {bytesToMB(resultBlob.size)} MB
              </span>
            )}
          </h2>
        }
        rightBody={
          <div className="absolute inset-2 flex flex-col">
            <PreviewImageBox
              previewUrl={previewUrl}
              resultUrl={resultUrl}
              resultAlt="Converted output preview"
            />
            {resultUrl ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 shrink-0"
              >
                <a
                  href={resultUrl}
                  download={downloadName}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-pf-control bg-pf-editorial-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-pf-accent-hover"
                >
                  Download {targetFormat.toUpperCase()}
                </a>
              </motion.div>
            ) : null}
          </div>
        }
      />

      <AppModals
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Invalid Conversion"
      >
        <p>
          You already uploaded a file with this extension. Converting to the
          same format is not allowed.
        </p>
      </AppModals>
    </ToolPageWrapper>
  );
}
