/** Object-removal workspace with a feature-owned mask editor. */
import { useRef, useState } from 'react';
import AiFeatureWorkspace from '@/shared/components/ai/AiFeatureWorkspace';
import { useSimulatedProgress } from '@/shared/hooks/ai/useSimulatedProgress';
import MissingMaskModal from './MissingMaskModal';
import ObjectRemoveControls from './ObjectRemoveControls';
import ObjectRemoveMaskCanvas from './ObjectRemoveMaskCanvas';
import { useObjectRemovePipeline } from './useObjectRemovePipeline';

const BRUSH_MIN = 8;
const BRUSH_MAX = 96;
const BRUSH_PRESETS = [
  { label: 'Fine', value: 16 },
  { label: 'Normal', value: 32 },
  { label: 'Wide', value: 64 },
];

/** Render the AI object-removal tool. */
export default function ObjectRemover() {
  const [progress, setProgress] = useState(0);
  const [hasMask, setHasMask] = useState(false);
  const [brushSize, setBrushSize] = useState(32);
  const maskCanvasRef = useRef(null);

  const {
    selectedFile,
    previewUrl,
    isProcessing,
    resultUrl,
    jobId,
    handleFileSelect,
    handleCancel,
    handleProcess,
    turnstileRef,
    setTurnstileToken,
    turnstileToken,
    appAlert,
    setAppAlert,
    usesRemaining,
    resetTimestamp,
    isLoading,
    maxLimit,
    isWaitingForToken,
  } = useObjectRemovePipeline(setProgress);

  useSimulatedProgress(isProcessing, setProgress, turnstileToken, 'objectremove');

  const handleObjectRemove = async () => {
    const maskBlob = await maskCanvasRef.current?.getMaskBlob();

    if (!maskBlob) {
      setAppAlert({ show: true, type: 'missing_mask' });
      return;
    }

    handleProcess(null, { maskBlob });
  };

  const handleObjectRemoveCancel = async () => {
    setHasMask(false);
    maskCanvasRef.current?.clearMask();
    await handleCancel();
  };

  const handleObjectRemoveFileSelect = async (file) => {
    setHasMask(false);
    await handleFileSelect(file);
  };

  return (
    <>
      <AiFeatureWorkspace
        selectedFile={selectedFile}
        previewUrl={previewUrl}
        isProcessing={isProcessing}
        isWaitingForToken={isWaitingForToken}
        resultUrl={resultUrl}
        jobId={jobId}
        usesRemaining={usesRemaining}
        resetTimestamp={resetTimestamp}
        isLoading={isLoading}
        maxLimit={maxLimit}
        appAlert={appAlert}
        setAppAlert={setAppAlert}
        featureName="objectremove"
        featureText="object removals"
        resultLabel="Object Removed"
        onFileSelect={handleObjectRemoveFileSelect}
        onCancel={handleObjectRemoveCancel}
        leftControls={
          <div className="space-y-6">
            {!isProcessing && !resultUrl && (
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label
                    htmlFor="brushSize"
                    className="text-[10px] font-bold uppercase tracking-[0.16em] text-pf-editorial-muted"
                  >
                    Brush size
                  </label>
                  <span className="font-mono text-xs text-pf-editorial-accent">
                    {brushSize}px
                  </span>
                </div>
                <input
                  id="brushSize"
                  type="range"
                  min={BRUSH_MIN}
                  max={BRUSH_MAX}
                  value={brushSize}
                  aria-valuetext={`${brushSize}px brush size`}
                  onChange={(event) => setBrushSize(Number(event.target.value))}
                  className="h-1 w-full cursor-pointer appearance-none bg-pf-editorial-line accent-pf-editorial-accent"
                />
                <p className="mt-3 text-xs leading-5 text-pf-editorial-muted">
                  {hasMask
                    ? 'Selection ready. Refine it on the canvas if needed.'
                    : 'Paint over the object you want PixelForge to reconstruct.'}
                </p>
                <div className="mt-4 grid grid-cols-3 border border-pf-editorial-line">
                  {BRUSH_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setBrushSize(preset.value)}
                      aria-pressed={brushSize === preset.value}
                      className={`border-r border-pf-editorial-line px-2 py-2 text-xs font-bold transition-colors last:border-r-0 ${
                        brushSize === preset.value
                          ? 'bg-pf-editorial-accent-soft text-pf-editorial-ink'
                          : 'text-pf-editorial-muted hover:bg-pf-editorial-raised hover:text-pf-editorial-ink'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <ObjectRemoveControls
              isProcessing={isProcessing}
              isWaitingForToken={isWaitingForToken}
              resultUrl={resultUrl}
              progress={progress}
              jobId={jobId}
              handleCancel={handleObjectRemoveCancel}
              handleProcess={handleObjectRemove}
              turnstileRef={turnstileRef}
              setTurnstileToken={setTurnstileToken}
            />
          </div>
        }
        downloadPrefix="ObjectRemoved-"
        previewOverride={
          previewUrl && !resultUrl ? (
            <ObjectRemoveMaskCanvas
              key={previewUrl}
              ref={maskCanvasRef}
              imageUrl={previewUrl}
              disabled={isProcessing}
              brushSize={brushSize}
              onMaskChange={setHasMask}
            />
          ) : null
        }
      />
      <MissingMaskModal appAlert={appAlert} setAppAlert={setAppAlert} />
    </>
  );
}
