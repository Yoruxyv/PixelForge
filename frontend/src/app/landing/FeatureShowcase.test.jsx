import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FeatureShowcase from './FeatureShowcase';

const renderShowcase = () =>
  render(
    <MemoryRouter>
      <FeatureShowcase />
    </MemoryRouter>,
  );

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
    renderShowcase();

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
    renderShowcase();

    const upscaleTab = screen.getByRole('tab', { name: /Upscale/ });
    const backgroundTab = screen.getByRole('tab', {
      name: /Background removal/,
    });

    fireEvent.click(backgroundTab);
    expect(backgroundTab).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByAltText('Background removal example - After'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /OPEN BACKGROUND REMOVAL/i }),
    ).toHaveAttribute('href', '/remove-bg');
    expect(screen.getByRole('tabpanel')).toHaveClass(
      'animate__animated',
      'animate__lightSpeedInLeft',
      'animate__faster',
    );

    fireEvent.keyDown(backgroundTab, { key: 'ArrowLeft' });
    expect(upscaleTab).toHaveAttribute('aria-selected', 'true');
    expect(upscaleTab).toHaveFocus();
    expect(
      screen.getByRole('link', { name: /OPEN UPSCALE/i }),
    ).toHaveAttribute('href', '/upscale');
  });

  it('rotates slowly until the user chooses a workflow', () => {
    vi.useFakeTimers();
    renderShowcase();

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

  it('does not rotate or animate when reduced motion is requested', () => {
    vi.useFakeTimers();
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    renderShowcase();

    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByRole('tab', { name: /Upscale/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tabpanel')).not.toHaveClass(
      'animate__animated',
      'animate__lightSpeedInLeft',
      'animate__faster',
    );

    fireEvent.click(
      screen.getByRole('tab', { name: /Background removal/ }),
    );
    expect(
      screen.getByAltText('Background removal example - After'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /OPEN BACKGROUND REMOVAL/i }),
    ).toHaveAttribute('href', '/remove-bg');
    expect(screen.getByRole('tabpanel')).not.toHaveClass(
      'animate__lightSpeedInLeft',
    );
  });
});
