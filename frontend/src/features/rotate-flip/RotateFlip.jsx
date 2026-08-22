/**
 * Rotate and flip workspace page.
 *
 * Provides client-side rotation/flip controls, preview transforms, reset behavior,
 * and downloadable transformed output.
 */

import { useMemo, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FILE_LIMITS } from '@/shared/config/imageValidation';
import UploadCard from '@/shared/components/upload/UploadCard';
import ToolWorkspaceShell from '@/shared/components/workspace/ToolWorkspaceShell';
import ToolPageWrapper from '@/shared/components/workspace/ToolPageWrapper';
import PreviewImageBox from '@/shared/components/workspace/PreviewImageBox';
import WorkspaceFileSummary from '@/shared/components/workspace/WorkspaceFileSummary';
import WorkspaceErrorAlert from '@/shared/components/workspace/WorkspaceErrorAlert';
import WorkspaceActionRow from '@/shared/components/workspace/WorkspaceActionRow';
import WorkspaceResultDownload from '@/shared/components/workspace/WorkspaceResultDownload';
import ClientSideHeader from '@/shared/components/workspace/ClientSideHeader';
import { useWorkspaceFile } from '@/shared/hooks/useWorkspaceFile';
import { generateSafeFilename } from '@/shared/lib/fileUtils';
import RotateFlipControls from './RotateFlipControls';
import { useRotateFlip } from './useRotateFlip';

/**
 * Render the rotate/flip workspace.
 *
 * @returns {JSX.Element} Rendered UI.
 */
export default function RotateFlip() {
  const fileInputRef = useRef(null);

  const workspaceState = useWorkspaceFile(fileInputRef);

  const {
    rotation,
    flipH,
    flipV,
    isProcessing,
    handleRotateLeft,
    handleRotateRight,
    handleFlipHorizontal,
    handleFlipVertical,
    applyTransform,
    resetTransform,
  } = useRotateFlip({
    file: workspaceState.file,
    previewUrl: workspaceState.previewUrl,
    setResultBlob: workspaceState.setResultBlob,
    setResultUrl: workspaceState.setResultUrl,
    setError: workspaceState.setError,
    cleanupResult: workspaceState.cleanupResult,
  });

  const handleResetAll = useCallback(() => {
    workspaceState.resetAll();
    resetTransform();
  }, [workspaceState, resetTransform]);

  const canProcess = useMemo(
    () =>
      Boolean(workspaceState.file) &&
      !isProcessing &&
      !workspaceState.resultUrl,
    [workspaceState.file, isProcessing, workspaceState.resultUrl],
  );

  const downloadName = useMemo(
    () => generateSafeFilename(workspaceState.file?.name, 'rotated', 'jpg'),
    [workspaceState.file?.name],
  );

  return (
    <ToolPageWrapper>
      <ToolWorkspaceShell
        minHeight="min-h-96"
        leftHeader={<ClientSideHeader />}
        leftBody={
          <div className="space-y-6">
            {!workspaceState.file ? (
              <UploadCard
                inputId="rf-file-input"
                inputRef={fileInputRef}
                onChange={workspaceState.onFileChange}
                helperText={`Any format up to ${FILE_LIMITS.MAX_FILE_SIZE_MB}MB`}
                hasActiveFile={Boolean(workspaceState.file)}
              />
            ) : (
              <WorkspaceFileSummary file={workspaceState.file} />
            )}

            <RotateFlipControls
              onRotateLeft={handleRotateLeft}
              onRotateRight={handleRotateRight}
              onFlipHorizontal={handleFlipHorizontal}
              onFlipVertical={handleFlipVertical}
              disabled={!workspaceState.file || workspaceState.resultUrl}
            />

            <WorkspaceErrorAlert error={workspaceState.error} />
          </div>
        }
        leftFooter={
          <WorkspaceActionRow
            primaryLabel={isProcessing ? 'Processing...' : 'Apply Transform'}
            secondaryLabel="Upload Other Image"
            onPrimaryClick={applyTransform}
            onSecondaryClick={handleResetAll}
            primaryDisabled={!canProcess}
          />
        }
        rightHeader={
          <h3 className="text-sm font-medium text-slate-700">
            Preview Workspace
          </h3>
        }
        rightBody={
          <div className="absolute inset-2 flex flex-col">
            <PreviewImageBox
              previewUrl={workspaceState.previewUrl}
              resultUrl={workspaceState.resultUrl}
              resultAlt="Transformed output preview"
            >
              {workspaceState.previewUrl && !workspaceState.resultUrl && (
                <div className="absolute inset-0 z-10 bg-white flex items-center justify-center overflow-hidden rounded-xl">
                  <img
                    src={workspaceState.previewUrl}
                    alt="Live CSS Preview"
                    className="h-full w-full object-contain pointer-events-none transition-transform duration-300 ease-out"
                    style={{
                      transform: `rotate(${rotation}deg) scaleX(${flipH}) scaleY(${flipV})`,
                    }}
                  />
                </div>
              )}
            </PreviewImageBox>

            <AnimatePresence>
              {workspaceState.resultUrl && (
                <WorkspaceResultDownload
                  resultUrl={workspaceState.resultUrl}
                  resultBlob={workspaceState.resultBlob}
                  originalFile={workspaceState.file}
                  downloadName={downloadName}
                  downloadLabel="Download Transformed Image"
                />
              )}
            </AnimatePresence>
          </div>
        }
      />
    </ToolPageWrapper>
  );
}
