import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UploadDropzone from './UploadDropzone';

const { mockUseFileUpload } = vi.hoisted(() => ({
  mockUseFileUpload: vi.fn(),
}));

vi.mock('@/shared/hooks/useFileUpload', () => ({
  useFileUpload: mockUseFileUpload,
}));

const handlers = {
  onDragOver: vi.fn(),
  onDragLeave: vi.fn(),
  onDrop: vi.fn(),
  onClick: vi.fn(),
  onChange: vi.fn(),
};

beforeEach(() => {
  mockUseFileUpload.mockReturnValue({
    isDragging: false,
    error: '',
    inputRef: { current: null },
    handlers,
  });
});

describe('UploadDropzone', () => {
  it('announces validation errors and associates them with the upload control', () => {
    mockUseFileUpload.mockReturnValue({
      isDragging: false,
      error: 'File size exceeds the 10MB limit.',
      inputRef: { current: null },
      handlers,
    });

    render(<UploadDropzone onFileSelect={vi.fn()} />);

    const uploadButton = screen.getByRole('button', {
      name: 'Upload image file',
    });
    const alert = screen.getByRole('alert');

    expect(alert).toHaveTextContent('File size exceeds the 10MB limit.');
    expect(uploadButton).toHaveAttribute('aria-describedby', alert.id);
  });

  it('does not attach an empty error description in the normal state', () => {
    render(<UploadDropzone onFileSelect={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Upload image file' }),
    ).not.toHaveAttribute('aria-describedby');
  });
});
