import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import CategoryShowcases from './CategoryShowcases';

describe('CategoryShowcases', () => {
  it('renders the three non-AI families from their actual tools', () => {
    render(<MemoryRouter><CategoryShowcases /></MemoryRouter>);

    expect(screen.queryByRole('region', { name: 'AI' })).not.toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Edit' })).getAllByRole('link')).toHaveLength(4);

    const optimizeLinks = within(screen.getByRole('region', { name: 'Optimize' })).getAllByRole('link');
    expect(optimizeLinks).toHaveLength(3);
    expect(optimizeLinks[0].parentElement).toHaveClass('lg:grid-cols-3');

    expect(within(screen.getByRole('region', { name: 'Utilities' })).getAllByRole('link')).toHaveLength(2);
    expect(screen.getByText('#585059')).toBeInTheDocument();
  });

  it('keeps utility artwork lazy and responsive', () => {
    render(<MemoryRouter><CategoryShowcases /></MemoryRouter>);

    const artwork = screen.getByAltText(
      'Curated pigment tiles used for palette extraction',
    );

    expect(artwork).toHaveAttribute('loading', 'lazy');
    expect(artwork).toHaveAttribute(
      'srcset',
      '/landing/utilities-palette-source-800.webp 800w, /landing/utilities-palette-source.webp 1536w',
    );
    expect(artwork).toHaveAttribute(
      'sizes',
      '(min-width: 1024px) calc(36.458vw - 2.24rem), (min-width: 640px) 58.75vw, calc(100vw - 2rem)',
    );
  });
});
