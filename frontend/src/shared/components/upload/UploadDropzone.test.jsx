import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UploadDropzone from './UploadDropzone';
import { UPLOAD_POLICIES } from '@/shared/config/imageValidation';

const { mockUseFileUpload, mockGetRuntimeLimits } = vi.hoisted(() => ({
  mockUseFileUpload: vi.fn(),
  mockGetRuntimeLimits: vi.fn(),
}));

vi.mock('@/shared/hooks/useFileUpload', () => ({
  useFileUpload: mockUseFileUpload,
}));

vi.mock('@/shared/validation/validators/runtimeLimits', () => ({
  getFallbackLimits: () => ({
    upload: { max_file_size_mb: 10, max_megapixels: 3 },
  }),
  getRuntimeLimits: mockGetRuntimeLimits,
}));

const handlers = {
  onDragOver: vi.fn(),
  onDragLeave: vi.fn(),
  onDrop: vi.fn(),
  onClick: vi.fn(),
  onChange: vi.fn(),
};

beforeEach(() => {
  mockGetRuntimeLimits.mockResolvedValue({
    upload: { max_file_size_mb: 10, max_megapixels: 3 },
  });
  mockUseFileUpload.mockReturnValue({
    isDragging: false,
    error: '',
    inputRef: { current: null },
    handlers,
    uploadConfirmation: null,
    confirmUpload: vi.fn(),
    dismissUploadConfirmation: vi.fn(),
    chooseAnotherImage: vi.fn(),
  });
});

describe('UploadDropzone', () => {
  it('announces validation errors and associates them with the upload control', () => {
    mockUseFileUpload.mockReturnValue({
      isDragging: false,
      error: 'File size exceeds the 10MB limit.',
      inputRef: { current: null },
      handlers,
      uploadConfirmation: null,
      confirmUpload: vi.fn(),
      dismissUploadConfirmation: vi.fn(),
      chooseAnotherImage: vi.fn(),
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

  it('does not advertise AI limits for browser-only tools', () => {
    render(<UploadDropzone onFileSelect={vi.fn()} />);

    expect(
      screen.getByText(
        'JPG, JPEG, PNG, WEBP · Processed locally in your browser',
      ),
    ).toBeVisible();
    expect(screen.queryByText(/Max 10MB/)).not.toBeInTheDocument();
  });

  it('renders backend-advertised AI file-size and resolution limits', async () => {
    mockGetRuntimeLimits.mockResolvedValue({
      upload: { max_file_size_mb: 8, max_megapixels: 2 },
    });

    render(
      <UploadDropzone
        onFileSelect={vi.fn()}
        uploadPolicy={UPLOAD_POLICIES.AI}
      />,
    );

    expect(
      await screen.findByText(
        'JPG, JPEG, PNG, WEBP · File size: up to 8MB · AI resolution: up to 2MP',
      ),
    ).toBeVisible();
  });
});
