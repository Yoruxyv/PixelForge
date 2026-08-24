import { useCallback, useEffect, useState } from 'react';
import { processImageWithCanvas } from '@/shared/lib/image/imageUtils';
import { compressImageToTargetSize } from './targetSizeCompression';

/**
 * Manages image compression task lifecycle and output generation.
 * @param {{
 *   file: File | null | undefined,
 *   quality: number,
 *   mode: 'level' | 'target',
 *   targetBytes: number | null,
 *   cleanupResult: () => void,
 *   setResultBlob: (blob: Blob) => void,
 *   setResultUrl: (url: string) => void,
 *   setError: (message: string) => void
 * }} params
 * @returns {{
 *   isCompressing: boolean,
 *   setIsCompressing: React.Dispatch<React.SetStateAction<boolean>>,
 *   compressImage: () => Promise<void>
 * }}
 */
export default function useImageCompression({
  file,
  quality,
  mode,
  targetBytes,
  cleanupResult,
  setResultBlob,
  setResultUrl,
  setError,
}) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [targetResult, setTargetResult] = useState(null);

  const clearCompressionResult = useCallback(() => {
    setTargetResult(null);
  }, []);

  useEffect(() => {
    clearCompressionResult();
  }, [clearCompressionResult, file]);

  const compressImage = useCallback(async () => {
    if (!file || isCompressing) return;

    setIsCompressing(true);
    setError('');
    cleanupResult();
    clearCompressionResult();

    try {
      let blob;

      if (mode === 'target') {
        const result = await compressImageToTargetSize(file, targetBytes);
        blob = result.blob;
        setTargetResult({
          targetBytes,
          targetReached: result.targetReached,
          quality: result.quality,
        });
      } else {
        blob = await processImageWithCanvas(file, {
          mimeType: 'image/jpeg',
          quality,
          fillBackground: true,
        });
      }

      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Unexpected compression error.',
      );
    } finally {
      setIsCompressing(false);
    }
  }, [
    cleanupResult,
    clearCompressionResult,
    file,
    isCompressing,
    mode,
    quality,
    setError,
    setResultBlob,
    setResultUrl,
    targetBytes,
  ]);

  return {
    isCompressing,
    setIsCompressing,
    compressImage,
    targetResult,
    clearCompressionResult,
  };
}
