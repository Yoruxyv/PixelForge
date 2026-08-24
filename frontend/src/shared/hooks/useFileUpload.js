import { useState, useRef, useCallback, useEffect } from 'react';
import { validateImageUpload } from '@/shared/validation/fileValidation';
import { UPLOAD_POLICIES } from '@/shared/config/imageValidation';
import { useImagePaste } from './useImagePaste';

/**
 * Reusable hook for handling file upload logic, drag & drop, and validation.
 *
 * @param {Object} params - Hook configuration.
 * @param {Function} params.onFileSelect - Callback triggered with the selected file and validation result.
 * @param {Function} [params.onValidationError] - Callback triggered when file validation fails.
 * @param {boolean} [params.validate=true] - Whether file validation should be applied.
 * @param {boolean} [params.requireGrayscale=false] - Whether uploaded images must be grayscale.
 * @param {number} [params.clearErrorAfterMs=5000] - Duration before clearing validation errors automatically.
 * @param {React.RefObject<HTMLInputElement>|null} [params.externalInputRef=null] - External file input reference.
 *
 * @returns {Object} Upload state and event handlers.
 * @returns {boolean} returns.isDragging - Whether a file is currently being dragged.
 * @returns {string} returns.error - Current validation error message.
 * @returns {React.RefObject<HTMLInputElement>} returns.inputRef - File input reference.
 * @returns {Function} returns.clearError - Clears the current error state.
 * @returns {Object} returns.handlers - File upload event handlers.
 */
export function useFileUpload({
  onFileSelect,
  onValidationError,
  validate = true,
  requireGrayscale = false,
  clearErrorAfterMs = 5000,
  externalInputRef = null,
  uploadPolicy = UPLOAD_POLICIES.DEFAULT,
}) {
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadConfirmation, setUploadConfirmation] = useState(null);

  const internalRef = useRef(null);
  const inputRef = externalInputRef || internalRef;
  const timeoutRef = useRef(null);

  const clearError = useCallback(() => {
    setError('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleError = useCallback(
    (msg) => {
      setError(msg);
      onValidationError?.(msg);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (clearErrorAfterMs > 0) {
        timeoutRef.current = setTimeout(() => {
          setError('');
          timeoutRef.current = null;
        }, clearErrorAfterMs);
      }
    },
    [clearErrorAfterMs, onValidationError],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const processFile = useCallback(
    async (
      file,
      activePolicy = uploadPolicy,
      confirmationAccepted = false,
    ) => {
      if (!file) return;
      clearError();
      setUploadConfirmation(null);

      if (!validate) {
        onFileSelect?.(file);
        if (inputRef.current) inputRef.current.value = '';
        return;
      }

      const result = await validateImageUpload(
        file,
        activePolicy,
        requireGrayscale,
      );

      if (!result.isValid) {
        handleError(result.error || 'Invalid file.');
        if (inputRef.current) inputRef.current.value = '';
        return;
      }

      if (
        result.requiresResizeConfirmation ||
        result.requiresAiOptimizationConfirmation ||
        result.requiresLargeImageConfirmation
      ) {
        setUploadConfirmation({ file, ...result });
        if (inputRef.current) inputRef.current.value = '';
        return;
      }

      onFileSelect?.(result.file || file, {
        ...result,
        resizeConfirmed:
          confirmationAccepted && activePolicy.resolutionMode === 'auto',
      });
      if (inputRef.current) inputRef.current.value = '';
    },
    [
      validate,
      onFileSelect,
      requireGrayscale,
      clearError,
      handleError,
      inputRef,
      uploadPolicy,
    ],
  );

  const confirmUpload = useCallback(() => {
    if (!uploadConfirmation?.file) return;

    if (uploadConfirmation.requiresAiOptimizationConfirmation) {
      processFile(
        uploadConfirmation.file,
        {
          ...uploadPolicy,
          fileSizeMode: 'optimize',
          resolutionMode: 'auto',
        },
        true,
      );
      return;
    }

    if (uploadConfirmation.requiresResizeConfirmation) {
      processFile(
        uploadConfirmation.file,
        {
          ...uploadPolicy,
          fileSizeMode: 'backend',
          resolutionMode: 'auto',
        },
        true,
      );
      return;
    }

    const confirmed = uploadConfirmation;
    setUploadConfirmation(null);
    onFileSelect?.(confirmed.file, {
      ...confirmed,
      requiresLargeImageConfirmation: false,
      warningConfirmed: true,
    });
  }, [onFileSelect, processFile, uploadConfirmation, uploadPolicy]);

  const dismissUploadConfirmation = useCallback(() => {
    setUploadConfirmation(null);
  }, []);

  const chooseAnotherImage = useCallback(() => {
    setUploadConfirmation(null);
    inputRef.current?.click();
  }, [inputRef]);

  useImagePaste(processFile);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleClick = useCallback(() => {
    if (error) clearError();
    inputRef.current?.click();
  }, [error, clearError, inputRef]);

  return {
    isDragging,
    error,
    inputRef,
    clearError,
    uploadConfirmation,
    confirmUpload,
    dismissUploadConfirmation,
    chooseAnotherImage,
    handlers: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      onChange: handleChange,
      onClick: handleClick,
    },
  };
}
