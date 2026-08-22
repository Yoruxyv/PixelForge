import { useState } from 'react';
import PropTypes from 'prop-types';
import UploadDropzone from '@/shared/components/upload/UploadDropzone';
import { FILE_LIMITS } from '@/shared/config/imageValidation';
import ResultActions from './ResultActions';
import ResultViewer from './ResultViewer';
import StagedFileCard from './StagedFileCard';
import WorkspaceLimitCard from './WorkspaceLimitCard';
import WorkspaceModals from './WorkspaceModals';

const getStateLabel = ({ resultUrl, isProcessing, isWaitingForToken, selectedFile }) => {
  if (resultUrl) return 'Result ready';
  if (isProcessing) return 'Processing';
  if (isWaitingForToken) return 'Verifying request';
  if (selectedFile) return 'Ready to process';
  return 'Awaiting image';
};

/** Image-first shell shared by PixelForge's backend AI workflows. */
export default function AiFeatureWorkspace({
  selectedFile,
  previewUrl,
  isProcessing,
  isWaitingForToken = false,
  resultUrl,
  jobId,
  usesRemaining,
  resetTimestamp,
  isLoading,
  maxLimit,
  appAlert,
  setAppAlert,
  featureName,
  featureText,
  resultLabel = 'Processed',
  sessionImageLabel = 'processed',
  onFileSelect,
  onCancel,
  leftControls,
  supportsList = FILE_LIMITS.ALLOWED_EXTENSIONS,
  downloadPrefix = 'Result-',
  requireGrayscale = false,
  previewOverride = null,
  canvasClassName = '',
}) {
  const [loadedResultUrl, setLoadedResultUrl] = useState(null);

  const showLimit =
    !selectedFile && !isProcessing && !jobId && !isLoading && usesRemaining <= 0;
  const stateLabel = getStateLabel({
    resultUrl,
    isProcessing,
    isWaitingForToken,
    selectedFile,
  });
  const isResultLoaded = loadedResultUrl === resultUrl;

  let canvasContent;

  if (resultUrl) {
    canvasContent = (
      <ResultViewer
        originalImage={previewUrl}
        processedImage={resultUrl}
        onImageLoad={() => setLoadedResultUrl(resultUrl)}
        resultLabel={resultLabel}
        canvasClassName={canvasClassName}
      />
    );
  } else if (selectedFile) {
    canvasContent = previewOverride || (
      <img
        src={previewUrl}
        alt="Upload preview"
        className={`max-h-[68vh] max-w-full object-contain transition-opacity duration-300 ${
          isProcessing ? 'opacity-60' : 'opacity-100'
        }`}
      />
    );
  } else {
    canvasContent = (
      <UploadDropzone
        onFileSelect={onFileSelect}
        requireGrayscale={requireGrayscale}
        variant="editorial"
      />
    );
  }

  return (
    <div className="w-full flex-1">
      <section className="mx-auto w-full max-w-pf-workspace px-pf-gutter pb-20 pt-6">
        {showLimit ? (
          <WorkspaceLimitCard
            maxLimit={maxLimit}
            resetTimestamp={resetTimestamp}
            featureText={featureText}
          />
        ) : (
          <div className="overflow-hidden border border-pf-editorial-line bg-pf-editorial-surface">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pf-editorial-line px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-pf-editorial-muted sm:text-xs">
                <span className="text-pf-editorial-accent">AI workflow</span>
                <span aria-hidden="true">/</span>
                <span>{stateLabel}</span>
              </div>
              <span
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-pf-editorial-muted"
                aria-live="polite"
              >
                {isLoading
                  ? 'Checking usage…'
                  : `${usesRemaining} of ${maxLimit} uses available`}
              </span>
            </div>

            <div className="grid min-h-[34rem] lg:grid-cols-[22rem_minmax(0,1fr)]">
              <aside className="order-2 flex flex-col border-t border-pf-editorial-line bg-pf-editorial-base p-5 lg:order-1 lg:border-r lg:border-t-0 lg:p-6">
                {!selectedFile ? (
                  <div className="my-auto space-y-8">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-pf-editorial-accent">
                        01 / Source
                      </p>
                      <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-pf-editorial-ink">
                        Start with one image.
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-pf-editorial-muted">
                        Drop, paste, or choose a file in the canvas. Your original remains available for comparison.
                      </p>
                    </div>
                    <div className="border-t border-pf-editorial-line pt-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-pf-editorial-muted">
                        Accepted input
                      </p>
                      <p className="mt-2 font-mono text-xs uppercase tracking-[0.08em] text-pf-editorial-ink">
                        {supportsList.join(' · ')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col">
                    <StagedFileCard
                      selectedFile={selectedFile}
                      isProcessing={isProcessing}
                      resultUrl={resultUrl}
                    />
                    <div className="mt-6 border-t border-pf-editorial-line pt-6">
                      {leftControls}
                      <ResultActions
                        resultUrl={resultUrl}
                        selectedFile={selectedFile}
                        isResultLoaded={isResultLoaded}
                        handleCancel={onCancel}
                        downloadPrefix={downloadPrefix}
                      />
                    </div>
                    <p className="mt-auto border-t border-pf-editorial-line pt-5 text-xs leading-5 text-pf-editorial-muted">
                      Results are temporary. Export finished work before the session expires.
                    </p>
                  </div>
                )}
              </aside>

              <div className={`order-1 relative flex min-h-[30rem] items-center justify-center overflow-hidden bg-pf-editorial-raised p-4 sm:p-6 lg:order-2 lg:min-h-[38rem] ${canvasClassName}`}>
                <div className="relative flex h-full min-h-[26rem] w-full items-center justify-center overflow-hidden">
                  {canvasContent}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <WorkspaceModals
        appAlert={appAlert}
        setAppAlert={setAppAlert}
        featureName={featureName}
        sessionImageLabel={sessionImageLabel}
      />
    </div>
  );
}

AiFeatureWorkspace.propTypes = {
  selectedFile: PropTypes.object,
  previewUrl: PropTypes.string,
  isProcessing: PropTypes.bool.isRequired,
  isWaitingForToken: PropTypes.bool,
  resultUrl: PropTypes.string,
  jobId: PropTypes.string,
  usesRemaining: PropTypes.number.isRequired,
  resetTimestamp: PropTypes.number,
  isLoading: PropTypes.bool.isRequired,
  maxLimit: PropTypes.number.isRequired,
  appAlert: PropTypes.object.isRequired,
  setAppAlert: PropTypes.func.isRequired,
  featureName: PropTypes.string.isRequired,
  featureText: PropTypes.string.isRequired,
  resultLabel: PropTypes.string,
  sessionImageLabel: PropTypes.string,
  onFileSelect: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  leftControls: PropTypes.node.isRequired,
  supportsList: PropTypes.arrayOf(PropTypes.string),
  downloadPrefix: PropTypes.string,
  requireGrayscale: PropTypes.bool,
  previewOverride: PropTypes.node,
  canvasClassName: PropTypes.string,
};
