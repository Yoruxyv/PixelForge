import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AiFeatureWorkspace from './AiFeatureWorkspace';

const baseProps = {
  selectedFile: null,
  previewUrl: null,
  isProcessing: false,
  resultUrl: null,
  jobId: null,
  usesRemaining: 3,
  resetTimestamp: null,
  isLoading: false,
  maxLimit: 3,
  appAlert: { show: false, type: null },
  setAppAlert: vi.fn(),
  featureName: 'upscale',
  featureText: 'upscales',
  onFileSelect: vi.fn(),
  onCancel: vi.fn(),
  leftControls: <button type="button">Process image</button>,
};

describe('AiFeatureWorkspace', () => {
  it('renders the workspace while usage metadata loads', () => {
    render(<AiFeatureWorkspace {...baseProps} isLoading />);

    expect(screen.getByText('Awaiting image')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload image file' })).toBeInTheDocument();
    expect(screen.getByText('Checking usage…')).toBeInTheDocument();
    expect(screen.queryByText('Preparing workspace')).not.toBeInTheDocument();
  });

  it('shows the quota state only after usage loading completes', () => {
    const { rerender } = render(
      <AiFeatureWorkspace {...baseProps} usesRemaining={0} isLoading />,
    );

    expect(screen.getByRole('button', { name: 'Upload image file' })).toBeInTheDocument();
    expect(screen.queryByText('Daily limit reached.')).not.toBeInTheDocument();

    rerender(
      <AiFeatureWorkspace
        {...baseProps}
        usesRemaining={0}
        isLoading={false}
        resetTimestamp={Date.now() + 60_000}
      />,
    );

    expect(screen.getByText('Daily limit reached.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Upload image file' })).not.toBeInTheDocument();
  });

  it('moves from the upload state to a processing workstation', () => {
    const { rerender } = render(<AiFeatureWorkspace {...baseProps} />);

    expect(screen.getByText('Awaiting image')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload image file' })).toBeInTheDocument();

    rerender(
      <AiFeatureWorkspace
        {...baseProps}
        selectedFile={{ name: 'source.png', size: 1024, type: 'image/png' }}
        previewUrl="source.png"
        isProcessing
      />,
    );

    expect(screen.getAllByText('Processing')).toHaveLength(2);
    expect(screen.getByAltText('Upload preview')).toBeInTheDocument();
    expect(screen.getByText('source.png')).toBeInTheDocument();

    rerender(
      <AiFeatureWorkspace
        {...baseProps}
        selectedFile={{ name: 'source.png', size: 1024, type: 'image/png' }}
        previewUrl="source.png"
        isWaitingForToken
      />,
    );

    expect(screen.getByText('Verifying request')).toBeInTheDocument();
  });
});
