/**
 * Image editor workspace page.
 *
 * Provides client-side filter controls, live canvas previews, reset behavior, and
 * final export for brightness/contrast/saturation-style edits.
 */

import { useRef } from 'react';
import { FILE_LIMITS } from '@/shared/config/imageValidation';

import FitModeToggle from '@/shared/components/image-viewer/FitModeToggle';
import Magnifier, {
  ZoomButton,
} from '@/shared/components/image-viewer/Magnifier';
import UploadCard from '@/shared/components/upload/UploadCard';
import ToolWorkspaceShell from '@/shared/components/workspace/ToolWorkspaceShell';
import ToolPageWrapper from '@/shared/components/workspace/ToolPageWrapper';
import PreviewImageBox from '@/shared/components/workspace/PreviewImageBox';
import WorkspaceFileSummary from '@/shared/components/workspace/WorkspaceFileSummary';
import WorkspaceErrorAlert from '@/shared/components/workspace/WorkspaceErrorAlert';
import ClientSideHeader from '@/shared/components/workspace/ClientSideHeader';

import { useWorkspaceFile } from '@/shared/hooks/useWorkspaceFile';
import ImageEditorFilters from './ImageEditorFilters';
import { useImageEditor } from './useImageEditor';

/**
 * Render the client-side image editor workspace.
 *
 * @returns {JSX.Element} Rendered UI.
 */
export default function ImageEditor() {
  const fileInputRef = useRef(null);
  const workspaceFile = useWorkspaceFile(fileInputRef);
  const { file, previewUrl, error, onFileChange } = workspaceFile;

  const {
    filters,
    isProcessing,
    isPreviewing,
    fitMode,
    previewDataUrl,
    canProcess,
    handleFilterChange,
    resetFilters,
    handleReset,
    toggleFitMode,
    applyFilters,
  } = useImageEditor(workspaceFile);

  // Show the canvas-rendered preview when ready, fall back to the raw source
  // while the first render is in flight.
  const displayUrl = previewDataUrl ?? previewUrl;

  return (
    <ToolPageWrapper>
      <ToolWorkspaceShell
        minHeight="min-h-96"
        leftHeader={
          <ClientSideHeader
            category="Edit / 01"
            title="Adjustments"
            description="Tune light, color, and tone with a live local preview, then export the finished image."
          />
        }
        leftBody={
          <div className="space-y-6">
            {!file ? (
              <UploadCard
                inputId="editor-file-input"
                inputRef={fileInputRef}
                onChange={onFileChange}
                helperText={`Any format up to ${FILE_LIMITS.MAX_FILE_SIZE_MB}MB`}
                hasActiveFile={Boolean(file)}
              />
            ) : (
              <WorkspaceFileSummary file={file} />
            )}

            <div
              className={`space-y-6 transition-opacity duration-300 ${!file ? 'pointer-events-none opacity-40' : 'opacity-100'}`}
            >
              <ImageEditorFilters
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>

            <WorkspaceErrorAlert error={error} />
          </div>
        }
        leftFooter={
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={handleReset}
              disabled={!file || isProcessing}
              className={`rounded-pf-control px-4 py-2.5 text-sm font-semibold transition-colors ${
                !file || isProcessing
                  ? 'cursor-not-allowed text-pf-editorial-muted opacity-40'
                  : 'text-pf-editorial-muted hover:bg-pf-editorial-raised hover:text-pf-editorial-ink'
              }`}
            >
              Edit Another
            </button>
            <button
              type="button"
              onClick={resetFilters}
              disabled={!file || isProcessing}
              className={`rounded-pf-control px-4 py-2.5 text-sm font-semibold transition-colors ${
                !file || isProcessing
                  ? 'cursor-not-allowed text-pf-editorial-muted opacity-40'
                  : 'text-pf-editorial-muted hover:bg-pf-editorial-raised hover:text-pf-editorial-ink'
              }`}
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={applyFilters}
              disabled={!canProcess}
              className={`flex-1 rounded-pf-control px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
                canProcess
                  ? 'bg-pf-editorial-accent hover:bg-pf-accent-hover'
                  : 'cursor-not-allowed bg-pf-editorial-accent opacity-40'
              }`}
            >
              {isProcessing ? 'Exporting...' : 'Export Image'}
            </button>
          </div>
        }
        rightHeader={
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-pf-editorial-ink">Live preview</h2>
            <span className="font-mono text-[0.65rem] uppercase tracking-wider text-pf-editorial-muted">Local render</span>
          </div>
        }
        rightBody={
          <div className="group absolute inset-2 flex flex-col overflow-hidden rounded-pf-control bg-pf-editorial-footer">
            <PreviewImageBox
              previewUrl={displayUrl}
              resultUrl={null}
              resultAlt="Edited output preview"
              previewClassName="hidden"
              processingClassName="hidden"
            >
              {displayUrl && (
                <Magnifier
                  containerClassName="absolute inset-0 z-10 flex items-center justify-center overflow-hidden"
                  innerClassName={`relative h-full w-full transition-all duration-200 ${
                    isProcessing || isPreviewing
                      ? 'scale-105 opacity-60 blur-[1px] grayscale-[0.1]'
                      : ''
                  }`}
                  renderControls={({ isZoomed, toggleZoom }) => (
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 flex gap-2">
                      <FitModeToggle
                        isFitMode={fitMode === 'contain'}
                        onToggle={toggleFitMode}
                        fitTitle="Fill container"
                        fillTitle="Show full image"
                      />
                      <ZoomButton
                        isZoomed={isZoomed}
                        onToggle={toggleZoom}
                        className={`rounded-pf-control border p-2 transition-colors ${
                          isZoomed
                            ? 'border-pf-editorial-accent bg-pf-editorial-accent text-white'
                            : 'border-pf-editorial-line bg-pf-editorial-surface text-pf-editorial-muted hover:text-pf-editorial-ink'
                        }`}
                      />
                    </div>
                  )}
                >
                  {() => (
                    <img
                      src={displayUrl}
                      alt="Edited preview"
                      className={`h-full w-full pointer-events-none ${
                        fitMode === 'contain'
                          ? 'object-contain'
                          : 'object-cover'
                      }`}
                    />
                  )}
                </Magnifier>
              )}
            </PreviewImageBox>
          </div>
        }
      />
    </ToolPageWrapper>
  );
}
