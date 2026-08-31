import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  it('exposes native progress semantics without changing the custom visual track', () => {
    const { container } = render(
      <ProgressBar progress={42.4} customText="Processing image..." />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Processing image...');
    expect(screen.getByRole('status')).toHaveTextContent('42%');
    expect(screen.getByRole('progressbar', { name: 'Processing progress' })).toHaveValue(42);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
