/** Background-removal workspace wiring. */
import { useState } from 'react';
import AiFeatureWorkspace from '@/shared/components/ai/AiFeatureWorkspace';
import { useSimulatedProgress } from '@/shared/hooks/ai/useSimulatedProgress';
import RemoveBgControls from './RemoveBgControls';
import { useRemBGPipeline } from './useRemBGPipeline';

/** Render the AI background-removal tool. */
export default function RemoveBG() {
  const [progress, setProgress] = useState(0);
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
  } = useRemBGPipeline(setProgress);

  useSimulatedProgress(isProcessing, setProgress, turnstileToken, 'rembg');

  return (
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
      featureName="rembg"
      featureText="background removals"
      resultLabel="Background Removed"
      onFileSelect={handleFileSelect}
      onCancel={handleCancel}
      leftControls={
        <RemoveBgControls
          isProcessing={isProcessing}
          isWaitingForToken={isWaitingForToken}
          resultUrl={resultUrl}
          progress={progress}
          jobId={jobId}
          handleCancel={handleCancel}
          handleProcess={handleProcess}
          turnstileRef={turnstileRef}
          setTurnstileToken={setTurnstileToken}
        />
      }
      downloadPrefix="NoBG-"
      canvasClassName="pf-transparency-grid"
    />
  );
}
