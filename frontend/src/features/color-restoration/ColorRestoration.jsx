/**
 * Color restoration workspace page.
 *
 * This page wires the generic AI feature workspace to the color restoration
 * pipeline. It requires grayscale input, displays feature-specific controls,
 * simulates progress while backend processing is active, and delegates shared
 * upload/result UI to `AiFeatureWorkspace`.
 */

import { useState } from 'react';
import AiFeatureWorkspace from '@/shared/components/ai/AiFeatureWorkspace';
import { useSimulatedProgress } from '@/shared/hooks/ai/useSimulatedProgress';
import ColorRestoreControls from './ColorRestoreControls';
import { useColorRestorePipeline } from './useColorRestorePipeline';

/**
 * Render the AI color restoration tool.
 *
 * @returns {JSX.Element} Color restoration workspace.
 */
export default function ColorRestoration() {
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
  } = useColorRestorePipeline(setProgress);

  useSimulatedProgress(
    isProcessing,
    setProgress,
    turnstileToken,
    'colorrestore',
  );

  return (
    <AiFeatureWorkspace
      requireGrayscale={true}
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
      featureName="colorrestore"
      featureText="color restorations"
      resultLabel="Color Restored"
      onFileSelect={handleFileSelect}
      onCancel={handleCancel}
      leftControls={
        <ColorRestoreControls
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
      downloadPrefix="Colorized-"
    />
  );
}
