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
});
