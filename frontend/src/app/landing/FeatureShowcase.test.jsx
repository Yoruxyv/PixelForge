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

  it('prioritizes only the initial Upscale comparison', () => {
    render(<FeatureShowcase />);

    const upscaleBefore = screen.getByAltText('Upscale example - Before');
    const upscaleAfter = screen.getByAltText('Upscale example - After');

    expect(upscaleBefore).toHaveAttribute('loading', 'eager');
    expect(upscaleAfter).toHaveAttribute('loading', 'eager');
    expect(upscaleBefore).not.toHaveAttribute('fetchpriority');
    expect(upscaleAfter).toHaveAttribute('fetchpriority', 'high');
    expect(upscaleAfter).toHaveAttribute(
      'srcset',
      '/demo/upscale_after-768.webp 768w, /demo/upscale_after.webp 1024w',
    );
    expect(upscaleAfter).toHaveAttribute(
      'sizes',
      '(min-width: 1280px) calc(58.333vw - 3.167rem), (min-width: 1024px) calc(66.667vw - 3.333rem), calc(100vw - 2rem)',
    );

    fireEvent.click(
      screen.getByRole('tab', { name: /Background removal/ }),
    );

    const backgroundBefore = screen.getByAltText(
      'Background removal example - Before',
    );
    const backgroundAfter = screen.getByAltText(
      'Background removal example - After',
    );

    expect(backgroundBefore).toHaveAttribute('loading', 'lazy');
    expect(backgroundAfter).toHaveAttribute('loading', 'lazy');
    expect(backgroundBefore).not.toHaveAttribute('fetchpriority');
    expect(backgroundAfter).not.toHaveAttribute('fetchpriority');
    expect(backgroundAfter).not.toHaveAttribute('srcset');
    expect(backgroundAfter).not.toHaveAttribute('sizes');
  });

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
