import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CompressImage from './CompressImage';

const mocks = vi.hoisted(() => ({
  useWorkspaceFile: vi.fn(),
  useImageCompression: vi.fn(),
}));

vi.mock('@/shared/hooks/useWorkspaceFile', () => ({
  useWorkspaceFile: mocks.useWorkspaceFile,
}));

vi.mock('./useImageCompression', () => ({
  default: mocks.useImageCompression,
}));

const workspace = (file = null) => ({
  file,
  previewUrl: '',
  resultBlob: null,
  setResultBlob: vi.fn(),
  resultUrl: '',
  setResultUrl: vi.fn(),
  error: '',
  setError: vi.fn(),
  onFileChange: vi.fn(),
  resetAll: vi.fn(),
  cleanupResult: vi.fn(),
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useWorkspaceFile.mockReturnValue(workspace());
  mocks.useImageCompression.mockReturnValue({
    isCompressing: false,
    setIsCompressing: vi.fn(),
    compressImage: vi.fn(),
    targetResult: null,
    clearCompressionResult: vi.fn(),
  });
});

const sourceFile = {
  name: 'source.png',
  type: 'image/png',
  size: 5 * 1024 * 1024,
};

const renderWithFile = () => {
  mocks.useWorkspaceFile.mockReturnValue(workspace(sourceFile));
  return render(<CompressImage />);
};

describe('CompressImage modes', () => {
  it('defaults to the existing Compression Level mode', () => {
    render(<CompressImage />);

    expect(
      screen.getByRole('button', { name: 'Compression Level' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('slider', { name: /Compression Level/ }),
    ).toHaveValue('0.4');
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('reveals the target input without enabling compression when no file exists', () => {
    render(<CompressImage />);

    fireEvent.click(screen.getByRole('button', { name: 'Target Size' }));

    expect(screen.getByLabelText('Target size')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Compress Image' }),
    ).toBeDisabled();
  });

  it('keeps compression disabled and reports an invalid target', () => {
    renderWithFile();
    fireEvent.click(screen.getByRole('button', { name: 'Target Size' }));

    fireEvent.change(screen.getByLabelText('Target size'), {
      target: { value: '5' },
    });

    expect(
      screen.getByText(
        'Target must be smaller than the original file (5.00 MB).',
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Target size')).toHaveValue(5);
    expect(
      screen.getByRole('button', { name: 'Compress Image' }),
    ).toBeDisabled();
  });

  it('does not show validation before the user enters a target', () => {
    renderWithFile();
    fireEvent.click(screen.getByRole('button', { name: 'Target Size' }));
    fireEvent.blur(screen.getByLabelText('Target size'));

    expect(
      screen.queryByText(/Target must be smaller than the original file/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Compress Image' }),
    ).toBeDisabled();
  });

  it('enables compression for a valid decimal target with a selected file', () => {
    renderWithFile();
    fireEvent.click(screen.getByRole('button', { name: 'Target Size' }));

    fireEvent.change(screen.getByLabelText('Target size'), {
      target: { value: '1.5' },
    });

    expect(
      screen.getByRole('button', { name: 'Compress Image' }),
    ).toBeEnabled();
  });

  it('displays the selected source size using the existing MB conversion', () => {
    renderWithFile();
    fireEvent.click(screen.getByRole('button', { name: 'Target Size' }));

    expect(screen.getByText('Original 5.00 MB')).toBeInTheDocument();
  });

  it('recomputes target validity when the selected file changes', () => {
    mocks.useWorkspaceFile.mockReturnValue(workspace(sourceFile));
    const { rerender } = render(<CompressImage />);
    fireEvent.click(screen.getByRole('button', { name: 'Target Size' }));
    fireEvent.change(screen.getByLabelText('Target size'), {
      target: { value: '1.5' },
    });
    expect(
      screen.getByRole('button', { name: 'Compress Image' }),
    ).toBeEnabled();

    mocks.useWorkspaceFile.mockReturnValue(
      workspace({ ...sourceFile, name: 'smaller.png', size: 1024 * 1024 }),
    );
    rerender(<CompressImage />);

    expect(screen.getByLabelText('Target size')).toHaveValue(1.5);
    expect(screen.getByText('Original 1.00 MB')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Target must be smaller than the original file (1.00 MB).',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Compress Image' }),
    ).toBeDisabled();
  });

  it('reset restores Compression Level and clears the target', () => {
    renderWithFile();
    fireEvent.click(screen.getByRole('button', { name: 'Target Size' }));
    fireEvent.change(screen.getByLabelText('Target size'), {
      target: { value: '1.5' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(
      screen.getByRole('button', { name: 'Compression Level' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('slider', { name: /Compression Level/ }),
    ).toHaveValue('0.4');

    fireEvent.click(screen.getByRole('button', { name: 'Target Size' }));
    expect(screen.getByLabelText('Target size')).toHaveValue(null);
  });

  it('retains both settings while switching modes', () => {
    renderWithFile();
    fireEvent.change(
      screen.getByRole('slider', { name: /Compression Level/ }),
      {
      target: { value: '0.75' },
      },
    );

    fireEvent.click(screen.getByRole('button', { name: 'Target Size' }));
    fireEvent.change(screen.getByLabelText('Target size'), {
      target: { value: '1.5' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Compression Level' }));

    expect(
      screen.getByRole('slider', { name: /Compression Level/ }),
    ).toHaveValue('0.75');
    expect(screen.getByText('75%')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Target Size' }));
    expect(screen.getByLabelText('Target size')).toHaveValue(1.5);
  });
});
