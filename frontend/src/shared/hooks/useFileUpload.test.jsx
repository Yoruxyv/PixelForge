import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFileUpload } from './useFileUpload';
import { UPLOAD_POLICIES } from '@/shared/config/imageValidation';

const mocks = vi.hoisted(() => ({
  validateImageUpload: vi.fn(),
}));

vi.mock('@/shared/validation/fileValidation', () => ({
  validateImageUpload: mocks.validateImageUpload,
}));

vi.mock('./useImagePaste', () => ({
  useImagePaste: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useFileUpload confirmations', () => {
  it('continues a browser-memory warning with the untouched original file', async () => {
    const file = new File(['source'], 'huge.png', { type: 'image/png' });
    const metadata = { width: 12000, height: 10000, pixels: 120_000_000 };
    const onFileSelect = vi.fn();
    mocks.validateImageUpload.mockResolvedValue({
      isValid: true,
      file,
      metadata,
      requiresLargeImageConfirmation: true,
    });
    const { result } = renderHook(() =>
      useFileUpload({ onFileSelect, uploadPolicy: UPLOAD_POLICIES.BROWSER }),
    );

    await act(async () => {
      await result.current.handlers.onChange({ target: { files: [file] } });
    });
    expect(result.current.uploadConfirmation).toMatchObject({ file, metadata });

    act(() => result.current.confirmUpload());

    expect(onFileSelect).toHaveBeenCalledWith(
      file,
      expect.objectContaining({
        warningConfirmed: true,
        requiresLargeImageConfirmation: false,
      }),
    );
    expect(result.current.uploadConfirmation).toBeNull();
    expect(mocks.validateImageUpload).toHaveBeenCalledTimes(1);
  });
});
