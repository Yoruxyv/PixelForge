/**
 * Image upscaling workspace page.
 *
 * This page wires the shared AI feature workspace to the upscale pipeline. It
 * owns page-level progress state, exposes scale controls, simulates progress
 * during backend processing, and delegates common upload/result UI to
 * `AiFeatureWorkspace`.
 */

import { useState } from 'react';
import AiFeatureWorkspace from '@/shared/components/ai/AiFeatureWorkspace';
import { useSimulatedProgress } from '@/shared/hooks/ai/useSimulatedProgress';
import UpscaleControls from './UpscaleControls';
import { useUpscalePipeline } from './useUpscalePipeline';

/**
 * Render the AI image upscaling tool.
 *
 * @returns {JSX.Element} Upscale workspace.
 */
export default function UpscaleWorkspace() {
  const [progress, setProgress] = useState(0);

  const {
    selectedFile,
    previewUrl,
    isProcessing,
    resultUrl,
    jobId,
    handleFileSelect,
    handleCancel,
    handleUpscale,
    turnstileRef,
    setTurnstileToken,
    turnstileToken,
    appAlert,
    setAppAlert,
    usesRemaining,
    resetTimestamp,
    isLoading,
    scale,
    setScale,
    maxLimit,
    isWaitingForToken,
  } = useUpscalePipeline(setProgress);

  useSimulatedProgress(isProcessing, setProgress, turnstileToken, 'upscale');

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
      featureName="upscale"
      featureText="upscales"
      resultLabel="Upscaled"
      sessionImageLabel="upscaled"
      onFileSelect={handleFileSelect}
      onCancel={handleCancel}
      leftControls={
        <UpscaleControls
          isProcessing={isProcessing}
          isWaitingForToken={isWaitingForToken}
          resultUrl={resultUrl}
          progress={progress}
          jobId={jobId}
          handleCancel={handleCancel}
          handleUpscale={handleUpscale}
          turnstileRef={turnstileRef}
          setTurnstileToken={setTurnstileToken}
          scale={scale}
          setScale={setScale}
        />
      }
      downloadPrefix="4K-"
    />
  );
}
