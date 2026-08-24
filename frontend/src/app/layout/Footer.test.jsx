import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Footer from './Footer';

const renderFooter = (openModal = vi.fn()) => {
  render(
    <MemoryRouter>
      <Footer openModal={openModal} />
    </MemoryRouter>,
  );

  return openModal;
};

describe('Footer', () => {
  it('links only to real product and project destinations', () => {
    renderFooter();

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Tools ↑' })).toHaveAttribute('href', '/#tools');
    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute(
      'href',
      'https://github.com/Yoruxyv/PixelForge',
    );
    expect(screen.getByRole('link', { name: /MIT License/ })).toHaveAttribute(
      'href',
      'https://github.com/Yoruxyv/PixelForge/blob/master/LICENSE',
    );
  });

  it.each([
    ['Privacy', 'privacy'],
    ['Terms', 'terms'],
    ['Security', 'security'],
    ['Cookies & Storage', 'storage'],
  ])('opens the %s modal', (label, type) => {
    const openModal = renderFooter();

    fireEvent.click(screen.getByRole('button', { name: label }));

    expect(openModal).toHaveBeenCalledWith(type);
  });
});
