import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FeatureShowcase from './FeatureShowcase';

describe('FeatureShowcase', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => vi.useRealTimers());

  it('switches workflows with pointer and arrow-key controls', () => {
    render(<FeatureShowcase />);

    const upscaleTab = screen.getByRole('tab', { name: /Upscale/ });
    const backgroundTab = screen.getByRole('tab', {
      name: /Background removal/,
    });

    fireEvent.click(backgroundTab);
    expect(backgroundTab).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByAltText('Background removal example - After'),
    ).toBeInTheDocument();

    fireEvent.keyDown(backgroundTab, { key: 'ArrowLeft' });
    expect(upscaleTab).toHaveAttribute('aria-selected', 'true');
    expect(upscaleTab).toHaveFocus();
  });

  it('rotates slowly until the user chooses a workflow', () => {
    vi.useFakeTimers();
    render(<FeatureShowcase />);

    const backgroundTab = screen.getByRole('tab', {
      name: /Background removal/,
    });
    const colorTab = screen.getByRole('tab', { name: /Color restoration/ });
    const objectTab = screen.getByRole('tab', { name: /Object removal/ });
    const showcase = backgroundTab.closest('figure');

    act(() => vi.advanceTimersByTime(6000));
    expect(backgroundTab).toHaveAttribute('aria-selected', 'true');

    fireEvent.mouseEnter(showcase);
    act(() => vi.advanceTimersByTime(6000));
    expect(backgroundTab).toHaveAttribute('aria-selected', 'true');

    fireEvent.mouseLeave(showcase);
    act(() => vi.advanceTimersByTime(6000));
    expect(colorTab).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(objectTab);
    act(() => vi.advanceTimersByTime(12000));
    expect(objectTab).toHaveAttribute('aria-selected', 'true');
  });

  it('does not rotate when reduced motion is requested', () => {
    vi.useFakeTimers();
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    render(<FeatureShowcase />);

    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByRole('tab', { name: /Upscale/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
