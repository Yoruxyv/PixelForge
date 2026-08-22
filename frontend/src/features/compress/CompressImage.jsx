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
import { generateSafeFilename } from '@/shared/lib/fileUtils';
import useImageCompression from './useImageCompression';

/** @constant {number} DEFAULT_QUALITY - Default JPEG quality value used for compression. */
const DEFAULT_QUALITY = 0.6;
const COMPRESS_MAX_SIZE_MB = 15;

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

  const { isCompressing, setIsCompressing, compressImage } =
    useImageCompression({
      file,
      quality,
      cleanupResult,
      setResultBlob,
      setResultUrl,
      setError,
    });

  /**
   * Resets the full compression workspace, including selected file, preview,
   * generated result, compression status, and slider value.
   */
  const handleReset = useCallback(() => {
    resetAll();
    setQuality(DEFAULT_QUALITY);
    setIsCompressing(false);
  }, [resetAll, setIsCompressing]);

  const canCompress = useMemo(
    () => Boolean(file) && !isCompressing,
    [file, isCompressing],
  );

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
        leftHeader={<ClientSideHeader />}
        leftBody={
          <>
            <div className="mb-4">
              <UploadCard
                inputId="compress-file-input"
                inputRef={fileInputRef}
                onChange={onFileChange}
                helperText={`Any format up to ${COMPRESS_MAX_SIZE_MB}MB`}
                maxSizeMB={COMPRESS_MAX_SIZE_MB}
                hasActiveFile={Boolean(file)}
              />
              <WorkspaceFileSummary file={file} />
            </div>

            <div className="mb-4 flex flex-col justify-center">
              <label className="mb-4 flex w-full items-center justify-between text-sm font-bold text-slate-700">
                <span>Compression Level</span>
                <span className="text-indigo-600">
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
                  onChange={(e) => setQuality(1 - Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-indigo-100 accent-indigo-600"
                />

                <div className="mt-2 flex w-full justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>High Quality</span>
                  <span>Small File</span>
                </div>
              </div>
            </div>

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
          <h3 className="flex items-center justify-between text-sm font-bold text-slate-800">
            Preview Workspace
            {resultBlob && savingsPercent > 0 && (
              <span className="rounded-md border border-emerald-200 bg-emerald-100/50 px-2 py-1 text-xs font-semibold text-emerald-600">
                Saved {savingsPercent}%
              </span>
            )}
          </h3>
        }
        rightBody={
          <div className="absolute inset-2 flex flex-col">
            <PreviewImageBox
              previewUrl={previewUrl}
              resultUrl={resultUrl}
              resultAlt="Compressed output preview"
            />
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
