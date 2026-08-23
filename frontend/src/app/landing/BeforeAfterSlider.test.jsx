import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BeforeAfterSlider from './BeforeAfterSlider';

describe('BeforeAfterSlider image loading', () => {
  it('defers comparison images by default', () => {
    render(
      <BeforeAfterSlider
        beforeImage="/before.webp"
        afterImage="/after.webp"
        altText="Example"
      />,
    );

    const before = screen.getByAltText('Example - Before');
    const after = screen.getByAltText('Example - After');

    expect(before).toHaveAttribute('loading', 'lazy');
    expect(after).toHaveAttribute('loading', 'lazy');
    expect(before).not.toHaveAttribute('fetchpriority');
    expect(after).not.toHaveAttribute('fetchpriority');
  });

  it('prioritizes only the after image for an initial comparison', () => {
    render(
      <BeforeAfterSlider
        beforeImage="/before.webp"
        afterImage="/after.webp"
        altText="Example"
        prioritizeImages
      />,
    );

    const before = screen.getByAltText('Example - Before');
    const after = screen.getByAltText('Example - After');

    expect(before).toHaveAttribute('loading', 'eager');
    expect(after).toHaveAttribute('loading', 'eager');
    expect(before).not.toHaveAttribute('fetchpriority');
    expect(after).toHaveAttribute('fetchpriority', 'high');
  });

  it('applies responsive attributes only when provided', () => {
    render(
      <BeforeAfterSlider
        beforeImage="/before.webp"
        afterImage="/after.webp"
        altText="Example"
        afterSrcSet="/after-768.webp 768w, /after.webp 1024w"
        afterSizes="(min-width: 1280px) calc(58.333vw - 3.167rem), (min-width: 1024px) calc(66.667vw - 3.333rem), calc(100vw - 2rem)"
      />,
    );

    const before = screen.getByAltText('Example - Before');
    const after = screen.getByAltText('Example - After');

    expect(after).toHaveAttribute(
      'srcset',
      '/after-768.webp 768w, /after.webp 1024w',
    );
    expect(after).toHaveAttribute(
      'sizes',
      '(min-width: 1280px) calc(58.333vw - 3.167rem), (min-width: 1024px) calc(66.667vw - 3.333rem), calc(100vw - 2rem)',
    );
    expect(before).not.toHaveAttribute('srcset');
    expect(before).not.toHaveAttribute('sizes');
  });

  it('keeps the comparison slider interactive', () => {
    render(
      <BeforeAfterSlider
        beforeImage="/before.webp"
        afterImage="/after.webp"
        altText="Example"
      />,
    );

    fireEvent.change(screen.getByRole('slider'), {
      target: { value: '72' },
    });

    expect(screen.getByAltText('Example - Before')).toHaveStyle({
      clipPath: 'inset(0 28% 0 0)',
    });
  });
});
